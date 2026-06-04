import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiUser, ApiTripCreate, ApiTripOut,
  ApiTripEntryCreate, ApiTripEntryOut,
} from './models/api.models';
import { Viaje, Entrada, Country } from '../features/usuario-perfil/viajes/models/viajes.model';
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

  // ── Países (RestCountries) ────────────────────────────────

  getPaises(): Observable<Country[]> {
    const url = environment.production
      ? 'https://restcountries.com/v3.1/all?fields=name,region,latlng,ccn3,cca3'
      : '/restcountries/v3.1/all?fields=name,region,latlng,ccn3,cca3';

    return this.http.get<any[]>(url).pipe(
      map(paises => paises.map(p => ({
        name: { common: p.name?.common || 'Desconocido' },
        ccn3: p.ccn3 || p.cca3 || 'XXX',
        region: p.region || 'Unknown',
        latlng: p.latlng || [0, 0],
      } as Country)).sort((a, b) => a.name.common.localeCompare(b.name.common)))
    );
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
