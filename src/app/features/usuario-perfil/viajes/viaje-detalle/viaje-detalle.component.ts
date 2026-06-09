import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { TripStoreService } from '@core/services/trip-store.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { Viaje, Entrada } from '@core/models/viajes.model';

@Component({
  selector: 'app-viaje-detalle',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './viaje-detalle.component.html',
  styleUrl: './viaje-detalle.component.scss'
})
export class ViajeDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private store = inject(TripStoreService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private cloudinary = inject(CloudinaryService);
  auth = inject(AuthService);

  viaje = signal<Viaje | null>(null);
  entradas = signal<Entrada[]>([]);
  editando = signal(false);
  cargando = signal(true);
  subiendoImagen = signal(false);
  previewImagenEdit = signal<string | null>(null);

  editForm = this.fb.group({
    description: [''],
    image: [''],
    tipo: ['realizado'],
  });

  ngOnInit() {
    const viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));

    const cargarEntradas = (id: number) => {
      this.api.getEntriesByTrip(id).subscribe({
        next: (entradas) => {
          entradas.forEach(e => this.store.addOrUpdateEntry(e));
          this.entradas.set(entradas);
        },
        error: () => this.toast.error('No se pudieron cargar las entradas.')
      });
    };

    const enStore = this.store.getTrip(viajeId);
    if (enStore) {
      this.viaje.set(enStore);
      this.cargando.set(false);
      cargarEntradas(viajeId);
      return;
    }

    this.api.getTrip(viajeId).subscribe({
      next: (viaje) => {
        this.viaje.set(viaje);
        this.store.addOrUpdateTrip(viaje);
        this.cargando.set(false);
        cargarEntradas(viajeId);
      },
      error: () => this.cargando.set(false),
    });
  }

  volverAlPerfil() {
    this.router.navigate(['/user', this.viaje()?.id_user]);
  }

  abrirEdicion() {
    const v = this.viaje();
    if (!v) return;
    this.editForm.patchValue({ description: v.description ?? '', image: v.image ?? '', tipo: v.tipo ?? 'realizado' });
    this.previewImagenEdit.set(v.image || null);
    this.editando.set(true);
  }

  onImageEditSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = () => this.previewImagenEdit.set(reader.result as string);
    reader.readAsDataURL(file);

    this.subiendoImagen.set(true);
    this.cloudinary.upload(file).subscribe({
      next: (url) => {
        this.editForm.controls.image.setValue(url);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.toast.error('Error al subir la imagen. Inténtalo de nuevo.');
        this.previewImagenEdit.set(this.viaje()?.image || null);
        this.subiendoImagen.set(false);
      }
    });
  }

  guardarEdicion() {
    const viaje = this.viaje();
    if (!viaje) return;
    const raw = this.editForm.value;
    const actualizado: Viaje = {
      ...viaje,
      description: raw.description || undefined,
      image: raw.image || viaje.image,
      tipo: raw.tipo as 'wishlist' | 'realizado',
    };
    this.api.updateTrip(viaje.id, actualizado).subscribe({
      next: (guardado) => {
        this.store.addOrUpdateTrip(guardado);
        this.viaje.set(guardado);
        this.editando.set(false);
      },
      error: () => this.toast.error('Error al guardar los cambios.')
    });
  }

  marcarComoRealizado() {
    const viaje = this.viaje();
    if (!viaje) return;
    const actualizado: Viaje = { ...viaje, tipo: 'realizado' };
    this.api.updateTrip(viaje.id, actualizado).subscribe({
      next: (guardado) => {
        this.store.addOrUpdateTrip(guardado);
        this.viaje.set(guardado);
      },
      error: () => this.toast.error('Error al actualizar el viaje.')
    });
  }

  agregarEntrada() {
    const viaje = this.viaje();
    if (!viaje) return;
    this.router.navigate(['/user', viaje.id_user, 'viajes', viaje.id, 'entradas']);
  }

  editarEntrada(entradaId: number) {
    const viaje = this.viaje();
    if (!viaje) return;
    this.router.navigate(['/user', viaje.id_user, 'viajes', viaje.id, 'entradas'], { queryParams: { entradaId } });
  }

  eliminarEntrada(entradaId: number) {
    if (!confirm('¿Seguro que quieres eliminar esta entrada?')) return;
    this.api.deleteEntry(entradaId).subscribe({
      next: () => {
        this.store.removeEntry(entradaId);
        this.entradas.update(list => list.filter(e => e.id !== entradaId));
      },
      error: () => this.toast.error('Error al eliminar la entrada.')
    });
  }
}
