import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/api.service';
import { TripStoreService } from '../../../../core/trip-store.service';
import { AuthService } from '../../../../core/auth.service';
import { Viaje, Entrada } from '../models/viajes.model';

@Component({
  selector: 'app-viaje-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './viaje-detalle.component.html',
  styleUrl: './viaje-detalle.component.scss'
})
export class ViajeDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private store = inject(TripStoreService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  viaje = signal<Viaje | null>(null);
  entradas = signal<Entrada[]>([]);
  editando = signal(false);
  cargando = signal(true);

  editForm = this.fb.group({
    description: [''],
    image: [''],
    tipo: ['realizado'],
  });

  ngOnInit() {
    const viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));

    // Primero intenta desde el store (si viene de crear)
    const enStore = this.store.getTrip(viajeId);
    if (enStore) {
      this.viaje.set(enStore);
      this.entradas.set(this.store.getEntriesByTrip(viajeId));
      this.cargando.set(false);
      return;
    }

    // Si no está en store, lo pide a la API
    this.api.getTrip(viajeId).subscribe({
      next: (viaje) => {
        this.viaje.set(viaje);
        this.store.addOrUpdateTrip(viaje);
        this.entradas.set(this.store.getEntriesByTrip(viajeId));
        this.cargando.set(false);
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
    this.editando.set(true);
  }

  onImageEditSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => this.editForm.controls.image.setValue(e.target?.result as string);
    reader.readAsDataURL(input.files[0]);
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
    // TODO: llamar a PUT /trips/{id} cuando el backend lo exponga
    this.store.addOrUpdateTrip(actualizado);
    this.viaje.set(actualizado);
    this.editando.set(false);
  }

  marcarComoRealizado() {
    const viaje = this.viaje();
    if (!viaje) return;
    const actualizado: Viaje = { ...viaje, tipo: 'realizado' };
    // TODO: llamar a PUT /trips/{id} cuando el backend lo exponga
    this.store.addOrUpdateTrip(actualizado);
    this.viaje.set(actualizado);
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
    // TODO: llamar a DELETE /trip-entries/{id} cuando el backend lo exponga
    this.store.removeEntry(entradaId);
    this.entradas.set(this.store.getEntriesByTrip(this.viaje()!.id));
  }
}
