import { Component, EventEmitter, Input, Output, signal, OnInit, HostListener } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Viaje, Country } from '@core/models/viajes.model';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { CloudinaryService } from '@core/services/cloudinary.service';

@Component({
  selector: 'app-viaje-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './viaje-form.component.html',
  styleUrls: ['./viaje-form.component.scss']
})
export class ViajeFormComponent implements OnInit {

  @Input() idUser!: number;
  @Output() guardar = new EventEmitter<Viaje>();
  @Output() cerrar = new EventEmitter<void>();

  errorValidacion = signal('');
  subiendoImagen = signal(false);
  previewImagen = signal<string | null>(null);
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
    cover_photo_url: [''],
    description: [''],
    tipo: ['wishlist', Validators.required],
    start_date: [''],
    end_date: [''],
    lat: [null as number | null],
    lng: [null as number | null],
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private cloudinary: CloudinaryService
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
        this.mostrarLista.set(true); // auto-abre la lista al terminar la carga
      },
      error: () => {
        this.toast.error('No se pudo cargar la lista de países.');
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
      image: raw.cover_photo_url ?? '',
      description: raw.description ?? '',
      start_date: raw.start_date || undefined,
      end_date: raw.end_date || undefined,
      lat: raw.lat ?? undefined,
      lng: raw.lng ?? undefined,
      tipo: raw.tipo as 'wishlist' | 'realizado'
    };

    this.guardar.emit(viaje);
    this.limpiarFormulario();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Preview local inmediato antes de subir
    const reader = new FileReader();
    reader.onload = () => this.previewImagen.set(reader.result as string);
    reader.readAsDataURL(file);

    this.subiendoImagen.set(true);
    this.cloudinary.upload(file).subscribe({
      next: (url) => {
        this.form.patchValue({ cover_photo_url: url });
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.toast.error('Error al subir la imagen. Inténtalo de nuevo.');
        this.previewImagen.set(null);
        this.subiendoImagen.set(false);
      }
    });
  }

  limpiarFormulario() {
    this.form.reset({ tipo: 'wishlist' });
    this.previewImagen.set(null);
    this.limpiarSeleccion();
  }
}