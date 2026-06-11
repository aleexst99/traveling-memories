import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface City {
  id:          number;
  name:        string;
  country:     string;
  countryCode: string;
  latitude:    number;
  longitude:   number;
}

interface GeoDbResponse {
  data: {
    id:          number;
    name:        string;
    city:        string;
    country:     string;
    countryCode: string;
    latitude:    number;
    longitude:   number;
    type:        string;
  }[];
}

const BASE_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

@Injectable({ providedIn: 'root' })
export class GeoDbService {
  private http = inject(HttpClient);

  private get headers() {
    return {
      'X-RapidAPI-Key':  environment.geoDbApiKey,
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
    };
  }

  /**
   * Busca ciudades por prefijo de nombre.
   * Filtra solo tipo CITY y ordena por población descendente.
   * Devuelve array vacío si hay error (ej: cuota agotada).
   */
  searchCities(prefix: string, limit = 8): Observable<City[]> {
    if (!prefix || prefix.trim().length < 2) return of([]);

    const params = {
      namePrefix: prefix.trim(),
      types:      'CITY',
      sort:       '-population',
      limit:      String(limit),
    };

    return this.http.get<GeoDbResponse>(`${BASE_URL}/cities`, {
      headers: this.headers,
      params,
    }).pipe(
      map(res => res.data.map(c => ({
        id:          c.id,
        name:        c.name,
        country:     c.country,
        countryCode: c.countryCode,
        latitude:    c.latitude,
        longitude:   c.longitude,
      }))),
      catchError(() => of([]))
    );
  }
}
