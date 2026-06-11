import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { GeoDbService, City } from '@core/services/geodb.service';
import { Entrada } from '@core/models/viajes.model';

@Component({
  selector: 'app-viaje-entrada',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './viaje-entrada.component.html',
  styleUrl: './viaje-entrada.component.scss'
})
export class ViajeEntradaComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private api        = inject(ApiService);
  private toast      = inject(ToastService);
  private cloudinary = inject(CloudinaryService);
  private geodb      = inject(GeoDbService);
  private fb         = inject(FormBuilder);

  viajeId!: number;
  userId!:  number;
  entradaExistente: Entrada | null = null;
  esEdicion  = false;
  guardando  = false;
  subiendoImagen = signal(false);
  previewImagen  = signal<string | null>(null);

  // City autocomplete
  citySearch     = signal('');
  citySuggestions = signal<City[]>([]);
  citySeleccionada = signal<City | null>(null);
  buscandoCiudad  = signal(false);
  mostrarSugerencias = signal(false);
  private cityInput$ = new Subject<string>();

  form = this.fb.group({
    title:       ['', Validators.required],
    fecha:       [''],
    dias:        [null as number | null],
    description: [''],
    image:       [''],
  });

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.city-selector')) {
      this.mostrarSugerencias.set(false);
    }
  }

  ngOnInit() {
    this.viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));
    this.userId  = Number(this.route.snapshot.paramMap.get('id'));

    // Debounce para no quemar peticiones a GeoDB
    this.cityInput$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(query => {
        this.buscandoCiudad.set(true);
        return this.geodb.searchCities(query);
      })
    ).subscribe(cities => {
      this.citySuggestions.set(cities);
      this.buscandoCiudad.set(false);
      this.mostrarSugerencias.set(cities.length > 0);
    });

    const entradaId = Number(this.route.snapshot.queryParamMap.get('entradaId'));
    if (!entradaId) return;

    this.api.getEntriesByTrip(this.viajeId).subscribe({
      next: (entradas) => {
        const entrada = entradas.find(e => e.id === entradaId) ?? null;
        if (entrada) this.cargarEntrada(entrada);
      },
      error: () => this.toast.error('No se pudo cargar la entrada.'),
    });
  }

  onCityInput(value: string) {
    this.citySearch.set(value);
    this.citySeleccionada.set(null);
    if (value.length >= 2) {
      this.cityInput$.next(value);
    } else {
      this.citySuggestions.set([]);
      this.mostrarSugerencias.set(false);
    }
  }

  seleccionarCiudad(city: City) {
    this.citySeleccionada.set(city);
    this.citySearch.set(`${city.name}, ${city.country}`);
    this.mostrarSugerencias.set(false);
  }

  limpiarCiudad() {
    this.citySeleccionada.set(null);
    this.citySearch.set('');
    this.citySuggestions.set([]);
  }

  private cargarEntrada(entrada: Entrada) {
    this.entradaExistente = entrada;
    this.esEdicion = true;
    this.form.patchValue({
      title:       entrada.title,
      fecha:       entrada.fecha ?? '',
      dias:        entrada.dias ?? null,
      description: entrada.description ?? '',
      image:       entrada.image ?? '',
    });
    if (entrada.city) this.citySearch.set(entrada.city);
    if (entrada.image) this.previewImagen.set(entrada.image);
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const error = this.cloudinary.validate(file);
    if (error) {
      this.toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewImagen.set(reader.result as string);
    reader.readAsDataURL(file);

    this.subiendoImagen.set(true);
    this.cloudinary.upload(file).subscribe({
      next: (url) => {
        this.form.controls.image.setValue(url);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.toast.error('Error al subir la imagen. Inténtalo de nuevo.');
        this.previewImagen.set(null);
        this.subiendoImagen.set(false);
      },
    });
  }

  guardar() {
    if (this.form.invalid || this.guardando || this.subiendoImagen()) return;
    const raw = this.form.value;

    const entrada: Entrada = {
      id:          this.entradaExistente?.id ?? 0,
      id_viaje:    this.viajeId,
      title:       raw.title!,
      fecha:       raw.fecha || undefined,
      dias:        raw.dias  || undefined,
      description: raw.description || undefined,
      image:       raw.image || this.entradaExistente?.image || undefined,
      city:        this.citySearch() || undefined,
    };

    this.guardando = true;

    const op = this.esEdicion && this.entradaExistente
      ? this.api.updateEntry(this.entradaExistente.id, entrada)
      : this.api.createEntry(entrada);

    op.subscribe({
      next: () => this.router.navigate(['/user', this.userId, 'viaje', this.viajeId]),
      error: () => {
        this.toast.error('Error al guardar la entrada. Inténtalo de nuevo.');
        this.guardando = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/user', this.userId, 'viaje', this.viajeId]);
  }
}
