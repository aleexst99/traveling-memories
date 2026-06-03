import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiUser, ApiTripCreate, ApiTripOut,
  ApiTripEntryCreate, ApiTripEntryOut,
  ApiCountryOut, ApiCityOut
} from './models/api.models';
import { Viaje, Entrada } from '../features/usuario-perfil/viajes/models/viajes.model';
import { User } from '../features/usuario-perfil/models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

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

  // ── Viajes ────────────────────────────────────────────────

  createTrip(viaje: Viaje): Observable<Viaje> {
    const body: ApiTripCreate = {
      title: viaje.title,
      user_id: viaje.id_user,
      cover_photo_url: viaje.image || undefined,
      summary: viaje.description || undefined,
      is_wishlist: viaje.tipo === 'wishlist',
    };
    return this.http.post<ApiTripOut>(`${this.base}/trips`, body).pipe(
      map(t => this.mapTrip(t))
    );
  }

  getTrip(tripId: number): Observable<Viaje> {
    return this.http.get<ApiTripOut>(`${this.base}/trips/${tripId}`).pipe(
      map(t => this.mapTrip(t))
    );
  }

  // ── Entradas ──────────────────────────────────────────────

  createEntry(entrada: Entrada): Observable<Entrada> {
    const body: ApiTripEntryCreate = {
      trip_id: entrada.id_viaje,
      title: entrada.title,
      content: entrada.description ?? '',
      entry_date: entrada.fecha ?? new Date().toISOString().split('T')[0],
    };
    return this.http.post<ApiTripEntryOut>(`${this.base}/trip-entries`, body).pipe(
      map(e => this.mapEntry(e))
    );
  }

  // ── Países y Ciudades ─────────────────────────────────────

  getCountries(): Observable<ApiCountryOut[]> {
    return this.http.get<ApiCountryOut[]>(`${this.base}/countries`);
  }

  getCities(): Observable<ApiCityOut[]> {
    return this.http.get<ApiCityOut[]>(`${this.base}/cities`);
  }

  // ── Mappers frontend ↔ backend ────────────────────────────

  mapUser(u: ApiUser): User {
    return {
      id: u.id,
      name: u.name,
      photo: u.avatar_url ?? 'assets/default-avatar.png',
      bio: u.bio ?? '',
      social: { github: '', linkedin: '' },
      trips: [],
      wishlist: [],
    };
  }

  mapTrip(t: ApiTripOut): Viaje {
    return {
      id: t.id,
      id_user: t.user_id,
      title: t.title,
      continent: '',
      image: t.cover_photo_url ?? '',
      description: t.summary,
      tipo: t.is_wishlist ? 'wishlist' : 'realizado',
    };
  }

  mapEntry(e: ApiTripEntryOut): Entrada {
    return {
      id: e.id,
      id_viaje: e.trip_id,
      title: e.title,
      fecha: e.entry_date,
      description: e.content,
    };
  }
}
