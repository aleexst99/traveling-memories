import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  ApiUser, ApiUserCreate, ApiUserUpdate, ApiTripCreate, ApiTripOut,
  ApiTripEntryCreate, ApiTripEntryOut,
} from '@core/models/api.models';
import { Viaje, Entrada, Country } from '@core/models/viajes.model';
import { User } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ── Auth ─────────────────────────────────────────────────

  register(data: ApiUserCreate): Observable<User> {
    return this.http.post<ApiUser>(`${this.base}/auth/register`, data).pipe(
      map(u => this.mapUser(u))
    );
  }

  // ── Usuarios ──────────────────────────────────────────────

  getUsers(): Observable<User[]> {
    return this.http.get<{ response: ApiUser[] }>(`${this.base}/users`).pipe(
      map(res => res.response.map(u => this.mapUser(u)))
    );
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<ApiUser>(`${this.base}/users/${userId}`).pipe(
      map(u => this.mapUser(u))
    );
  }

  updateUser(userId: number, data: ApiUserUpdate): Observable<User> {
    return this.http.put<ApiUser>(`${this.base}/users/${userId}`, data).pipe(
      map(u => this.mapUser(u))
    );
  }

  // ── Viajes ────────────────────────────────────────────────

  getTripsByUser(userId: number): Observable<Viaje[]> {
    return this.http.get<ApiTripOut[]>(`${this.base}/trips/user/${userId}`).pipe(
      map(trips => trips.map(t => this.mapTrip(t)))
    );
  }

  getTrip(tripId: number): Observable<Viaje> {
    return this.http.get<ApiTripOut>(`${this.base}/trips/${tripId}`).pipe(
      map(t => this.mapTrip(t))
    );
  }

  createTrip(viaje: Viaje): Observable<Viaje> {
    const body: ApiTripCreate = {
      title: viaje.title,
      user_id: viaje.id_user,
      cover_photo_url: viaje.image || undefined,
      summary: viaje.description || undefined,
      is_wishlist: viaje.tipo === 'wishlist',
      start_date: viaje.start_date || undefined,
      end_date: viaje.end_date || undefined,
      lat: viaje.lat ?? null,
      lng: viaje.lng ?? null,
      continent: viaje.continent || null,
    };
    return this.http.post<ApiTripOut>(`${this.base}/trips`, body).pipe(
      map(t => this.mapTrip(t))
    );
  }

  updateTrip(tripId: number, viaje: Viaje): Observable<Viaje> {
    const body: ApiTripCreate = {
      title: viaje.title,
      user_id: viaje.id_user,
      cover_photo_url: viaje.image || undefined,
      summary: viaje.description || undefined,
      is_wishlist: viaje.tipo === 'wishlist',
      start_date: viaje.start_date || undefined,
      end_date: viaje.end_date || undefined,
      lat: viaje.lat ?? null,
      lng: viaje.lng ?? null,
      continent: viaje.continent || null,
    };
    return this.http.put<ApiTripOut>(`${this.base}/trips/${tripId}`, body).pipe(
      map(t => this.mapTrip(t))
    );
  }

  deleteTrip(tripId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/trips/${tripId}`);
  }

  // ── Entradas ──────────────────────────────────────────────

  getEntriesByTrip(tripId: number): Observable<Entrada[]> {
    return this.http.get<ApiTripEntryOut[]>(`${this.base}/trip-entries/trip/${tripId}`).pipe(
      map(entries => entries.map(e => this.mapEntry(e)))
    );
  }

  createEntry(entrada: Entrada): Observable<Entrada> {
    const body: ApiTripEntryCreate = {
      trip_id: entrada.id_viaje,
      title: entrada.title,
      content: entrada.description ?? '',
      entry_date: entrada.fecha ?? new Date().toISOString().split('T')[0],
      image_url: entrada.image || undefined,
    };
    return this.http.post<ApiTripEntryOut>(`${this.base}/trip-entries`, body).pipe(
      map(e => this.mapEntry(e))
    );
  }

  updateEntry(entradaId: number, entrada: Entrada): Observable<Entrada> {
    const body: ApiTripEntryCreate = {
      trip_id: entrada.id_viaje,
      title: entrada.title,
      content: entrada.description ?? '',
      entry_date: entrada.fecha ?? new Date().toISOString().split('T')[0],
      image_url: entrada.image || undefined,
    };
    return this.http.put<ApiTripEntryOut>(`${this.base}/trip-entries/${entradaId}`, body).pipe(
      map(e => this.mapEntry(e))
    );
  }

  deleteEntry(entradaId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/trip-entries/${entradaId}`);
  }

  // ── Países (asset local) ──────────────────────────────────

  getPaises(): Observable<Country[]> {
    return this.http.get<Country[]>('assets/countries.json');
  }

  // ── Mappers frontend ↔ backend ────────────────────────────

  mapUser(u: ApiUser): User {
    return {
      id: u.id,
      name: u.name,
      photo: u.avatar_url ?? this.generateInitialsAvatar(u.name),
      bio: u.bio ?? '',
      social: { github: '', linkedin: '' },
      trips: [],
      wishlist: [],
    };
  }

  private generateInitialsAvatar(name: string): string {
    const initials = name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const colors = ['#007bff', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];
    const color = colors[name.charCodeAt(0) % colors.length];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="${color}"/>
        <text x="50" y="56" font-family="Arial" font-size="36"
          font-weight="bold" fill="white" text-anchor="middle"
          dominant-baseline="middle">${initials}</text>
      </svg>`.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  mapTrip(t: ApiTripOut): Viaje {
    return {
      id: t.id,
      id_user: t.user_id,
      title: t.title,
      continent: t.continent ?? '',
      image: t.cover_photo_url ?? '',
      description: t.summary,
      start_date: t.start_date,
      end_date: t.end_date,
      tipo: t.is_wishlist ? 'wishlist' : 'realizado',
      lat: t.lat ?? undefined,
      lng: t.lng ?? undefined,
    };
  }

  mapEntry(e: ApiTripEntryOut): Entrada {
    return {
      id: e.id,
      id_viaje: e.trip_id,
      title: e.title,
      fecha: e.entry_date,
      description: e.content,
      image: e.image_url,
    };
  }
}
