import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '@core/services/api.service';
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
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private api       = inject(ApiService);
  private fb        = inject(FormBuilder);
  private toast     = inject(ToastService);
  private cloudinary = inject(CloudinaryService);
  auth              = inject(AuthService);

  viaje   = signal<Viaje | null>(null);
  entradas = signal<Entrada[]>([]);
  editando = signal(false);
  cargando = signal(true);
  subiendoImagen      = signal(false);
  previewImagenEdit   = signal<string | null>(null);

  editForm = this.fb.group({
    description: [''],
    image:       [''],
    tipo:        ['realizado'],
  });

  ngOnInit() {
    const viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));

    forkJoin({
      viaje:   this.api.getTrip(viajeId),
      entradas: this.api.getEntriesByTrip(viajeId),
    }).subscribe({
      next: ({ viaje, entradas }) => {
        this.viaje.set(viaje);
        this.entradas.set(entradas);
        this.cargando.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar el viaje.');
        this.cargando.set(false);
      },
    });
  }

  volverAlPerfil() {
    this.router.navigate(['/user', this.viaje()?.id_user]);
  }

  abrirEdicion() {
    const v = this.viaje();
    if (!v) return;
    this.editForm.patchValue({
      description: v.description ?? '',
      image:       v.image ?? '',
      tipo:        v.tipo ?? 'realizado',
    });
    this.previewImagenEdit.set(v.image || null);
    this.editando.set(true);
  }

  onImageEditSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const error = this.cloudinary.validate(file);
    if (error) {
      this.toast.error(error);
      return;
    }

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
      image:       raw.image || viaje.image,
      tipo:        raw.tipo as 'wishlist' | 'realizado',
    };
    this.api.updateTrip(viaje.id, actualizado).subscribe({
      next: (guardado) => {
        this.viaje.set(guardado);
        this.editando.set(false);
      },
      error: () => this.toast.error('Error al guardar los cambios.'),
    });
  }

  marcarComoRealizado() {
    const viaje = this.viaje();
    if (!viaje) return;
    this.api.updateTrip(viaje.id, { ...viaje, tipo: 'realizado' }).subscribe({
      next: (guardado) => this.viaje.set(guardado),
      error: () => this.toast.error('Error al actualizar el viaje.'),
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
    this.router.navigate(
      ['/user', viaje.id_user, 'viajes', viaje.id, 'entradas'],
      { queryParams: { entradaId } }
    );
  }

  eliminarViaje() {
    const viaje = this.viaje();
    if (!viaje) return;
    if (!confirm(`¿Seguro que quieres eliminar "${viaje.title}"? Esta acción no se puede deshacer.`)) return;
    this.api.deleteTrip(viaje.id).subscribe({
      next: () => this.router.navigate(['/user', viaje.id_user]),
      error: () => this.toast.error('Error al eliminar el viaje.'),
    });
  }

  eliminarEntrada(entradaId: number) {
    if (!confirm('¿Seguro que quieres eliminar esta entrada?')) return;
    this.api.deleteEntry(entradaId).subscribe({
      next: () => this.entradas.update(list => list.filter(e => e.id !== entradaId)),
      error: () => this.toast.error('Error al eliminar la entrada.'),
    });
  }
}
