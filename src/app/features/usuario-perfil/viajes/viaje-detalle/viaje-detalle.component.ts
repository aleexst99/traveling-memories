import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../../core/storage.service';
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
  private storage = inject(StorageService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  viaje = signal<Viaje | null>(null);
  entradas = signal<Entrada[]>([]);
  editando = signal(false);

  editForm = this.fb.group({
    description: [''],
    image: [''],
    tipo: ['realizado'],
  });

  ngOnInit() {
    const viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));
    const viaje = this.storage.getViaje(viajeId);
    if (viaje) {
      this.viaje.set(viaje);
      this.entradas.set(viaje.entradas ?? []);
    }
  }

  volverAlPerfil() {
    const userId = this.viaje()?.id_user;
    this.router.navigate(['/user', userId]);
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
    this.storage.saveViaje(actualizado);
    this.viaje.set(actualizado);
    this.editando.set(false);
  }

  marcarComoRealizado() {
    const viaje = this.viaje();
    if (!viaje) return;
    const actualizado: Viaje = { ...viaje, tipo: 'realizado' };
    this.storage.saveViaje(actualizado);
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

  refreshEntradas() {
    const viaje = this.viaje();
    if (!viaje) return;
    const actualizado = this.storage.getViaje(viaje.id);
    if (actualizado) this.entradas.set(actualizado.entradas ?? []);
  }

  eliminarEntrada(entradaId: number) {
    if (!confirm('¿Seguro que quieres eliminar esta entrada?')) return;
    const viaje = this.viaje();
    if (!viaje) return;
    this.storage.deleteEntrada(viaje.id, entradaId);
    this.entradas.set(this.storage.getEntradas(viaje.id));
  }
}
