import { Injectable } from '@angular/core';
import { Viaje, Entrada } from '../features/usuario-perfil/viajes/models/viajes.model';
import { environment } from '../../environments/environment';

const VIAJES_KEY = 'tm_viajes';
const SEEDED_KEY = 'tm_seeded_users';

@Injectable({ providedIn: 'root' })
export class StorageService {

  /** En producción (con backend) este servicio será sustituido por llamadas HTTP.
   *  El flag environment.useLocalStorage controla si se usa localStorage o la API. */

  // ── Seed (migración desde JSON) ───────────────────────────

  isUserSeeded(userId: number): boolean {
    if (!environment.useLocalStorage) return true;
    const seeded: number[] = JSON.parse(localStorage.getItem(SEEDED_KEY) || '[]');
    return seeded.includes(userId);
  }

  seedUser(userId: number, trips: Viaje[], wishlist: Viaje[]): void {
    if (!environment.useLocalStorage) return;
    const all: Viaje[] = [
      ...trips.map(t => ({ ...t, id_user: userId, tipo: 'realizado' as const })),
      ...wishlist.map(t => ({ ...t, id_user: userId, tipo: 'wishlist' as const })),
    ];
    all.forEach(v => this.saveViaje(v));

    const seeded: number[] = JSON.parse(localStorage.getItem(SEEDED_KEY) || '[]');
    seeded.push(userId);
    localStorage.setItem(SEEDED_KEY, JSON.stringify(seeded));
  }

  // ── Viajes ────────────────────────────────────────────────

  getViajes(): Viaje[] {
    if (!environment.useLocalStorage) return [];
    const raw = localStorage.getItem(VIAJES_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  getViajesByUser(userId: number): Viaje[] {
    return this.getViajes().filter(v => v.id_user === userId);
  }

  getViaje(viajeId: number): Viaje | undefined {
    return this.getViajes().find(v => v.id === viajeId);
  }

  saveViaje(viaje: Viaje): void {
    if (!environment.useLocalStorage) return;
    const viajes = this.getViajes();
    const idx = viajes.findIndex(v => v.id === viaje.id);
    if (idx >= 0) {
      viajes[idx] = viaje;
    } else {
      viajes.push(viaje);
    }
    localStorage.setItem(VIAJES_KEY, JSON.stringify(viajes));
  }

  deleteViaje(viajeId: number): void {
    if (!environment.useLocalStorage) return;
    const viajes = this.getViajes().filter(v => v.id !== viajeId);
    localStorage.setItem(VIAJES_KEY, JSON.stringify(viajes));
  }

  // ── Entradas ──────────────────────────────────────────────

  getEntradas(viajeId: number): Entrada[] {
    return this.getViaje(viajeId)?.entradas ?? [];
  }

  saveEntrada(viajeId: number, entrada: Entrada): void {
    if (!environment.useLocalStorage) return;
    const viajes = this.getViajes();
    const viaje = viajes.find(v => v.id === viajeId);
    if (!viaje) return;

    viaje.entradas = viaje.entradas ?? [];
    const idx = viaje.entradas.findIndex(e => e.id === entrada.id);
    if (idx >= 0) {
      viaje.entradas[idx] = entrada;
    } else {
      viaje.entradas.push(entrada);
    }
    localStorage.setItem(VIAJES_KEY, JSON.stringify(viajes));
  }

  deleteEntrada(viajeId: number, entradaId: number): void {
    if (!environment.useLocalStorage) return;
    const viajes = this.getViajes();
    const viaje = viajes.find(v => v.id === viajeId);
    if (!viaje) return;
    viaje.entradas = (viaje.entradas ?? []).filter(e => e.id !== entradaId);
    localStorage.setItem(VIAJES_KEY, JSON.stringify(viajes));
  }
}
