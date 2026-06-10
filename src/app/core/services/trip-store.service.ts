import { Injectable, signal } from '@angular/core';
import { Viaje, Entrada } from '@core/models/viajes.model';

/**
 * Cache en memoria de viajes y entradas para la sesión actual.
 * Se sincroniza con el backend a través de ApiService.
 */
@Injectable({ providedIn: 'root' })
export class TripStoreService {
  private trips = signal<Viaje[]>([]);
  private entries = signal<Entrada[]>([]);

  // ── Viajes ────────────────────────────────────────────────

  addOrUpdateTrip(viaje: Viaje): void {
    this.trips.update(list => {
      const idx = list.findIndex(v => v.id === viaje.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = viaje;
        return updated;
      }
      return [...list, viaje];
    });
  }

  getTripsByUser(userId: number): Viaje[] {
    return this.trips().filter(v => v.id_user === userId);
  }

  getTrip(viajeId: number): Viaje | undefined {
    return this.trips().find(v => v.id === viajeId);
  }

  removeTrip(viajeId: number): void {
    this.trips.update(list => list.filter(v => v.id !== viajeId));
  }

  // ── Entradas ──────────────────────────────────────────────

  addOrUpdateEntry(entrada: Entrada): void {
    this.entries.update(list => {
      const idx = list.findIndex(e => e.id === entrada.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = entrada;
        return updated;
      }
      return [...list, entrada];
    });
  }

  getEntriesByTrip(viajeId: number): Entrada[] {
    return this.entries().filter(e => e.id_viaje === viajeId);
  }

  removeEntry(entradaId: number): void {
    this.entries.update(list => list.filter(e => e.id !== entradaId));
  }
}
