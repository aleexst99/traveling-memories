import { Component, EventEmitter, Input, Output, signal, OnInit, HostListener } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Viaje, Country } from '../viajes/models/viajes.model';
import { ApiService } from '../../../core/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viaje-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './viaje-form.component.html',
  styleUrls: ['./viaje-form.component.scss']
})
export class ViajeFormComponent implements OnInit {

  @Input() idUser!: number;
  @Output() guardar = new EventEmitter<Viaje>();
  @Output() cerrar = new EventEmitter<void>();

  errorValidacion = signal('');
  paises = signal<Country[]>([]);
  filtrados = signal<Country[]>([]);
  paisSeleccionado = signal<Country | null>(null);
  searchText = signal('');
  mostrarLista = signal(false);
  cargandoPaises = signal(true);

  // 🧱 Formulario reactivo
  form = this.fb.group({
    title: ['', Validators.required],
    continent: [''],
    image: [''],
    description: [''],
    tipo: ['wishlist', Validators.required],
    lat: [null as number | null],
    lng: [null as number | null],
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.cargarPaises();
  }

  // Detectar clics fuera del selector para cerrar la lista
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.selector-container')) {
      this.mostrarLista.set(false);
    }
  }

  cargarPaises() {
    this.cargandoPaises.set(true);

    this.api.getPaises().subscribe({
      next: (data: Country[]) => {
        this.paises.set(data);
        this.filtrados.set(data);
        this.cargandoPaises.set(false);
      },
      error: (error) => {
        console.error('Error al cargar países:', error);
        this.cargandoPaises.set(false);
      }
    });
  }

  filtrar(texto: string) {
    this.searchText.set(texto);
    this.mostrarLista.set(true);

    if (!texto.trim()) {
      this.filtrados.set(this.paises());
      return;
    }

    const textoLower = texto.toLowerCase();
    const result = this.paises().filter(p =>
      p.name.common.toLowerCase().includes(textoLower) ||
      p.region.toLowerCase().includes(textoLower)
    );

    this.filtrados.set(result);
  }

  seleccionarPais(pais: Country) {
    this.paisSeleccionado.set(pais);
    this.searchText.set(pais.name.common);
    this.mostrarLista.set(false);

    // Actualiza el formulario con los datos del país
    this.form.patchValue({
      title: pais.name.common,
      continent: pais.region,
      lat: pais.latlng[0],
      lng: pais.latlng[1]
    });
  }

  limpiarSeleccion() {
    this.paisSeleccionado.set(null);
    this.searchText.set('');
    this.filtrados.set(this.paises());
    this.mostrarLista.set(false);

    this.form.patchValue({
      title: '',
      continent: '',
      lat: null,
      lng: null
    });
  }

  guardarViaje() {
    if (this.form.invalid || !this.paisSeleccionado()) {
      this.errorValidacion.set('Selecciona un país antes de guardar.');
      return;
    }
    this.errorValidacion.set('');

    const raw = this.form.value;

    const viaje: Viaje = {
      id: Date.now(),
      id_user: this.idUser,
      title: raw.title!,
      continent: raw.continent!,
      image: raw.image ?? '',
      description: raw.description ?? '',
      lat: raw.lat ?? undefined,
      lng: raw.lng ?? undefined,
      tipo: raw.tipo as 'wishlist' | 'realizado'
    };

    this.guardar.emit(viaje);
    this.limpiarFormulario();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Convertir a base64 y guardar en el form
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64 = e.target?.result as string;
        this.form.controls.image.setValue(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  limpiarFormulario() {
    this.form.reset({
      tipo: 'wishlist'
    });
    this.limpiarSeleccion();
  }
}