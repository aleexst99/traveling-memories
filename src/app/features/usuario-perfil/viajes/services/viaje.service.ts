import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface Country {
  name: {
    common: string;
  };
  ccn3: string;
  region: string;
  latlng: [number, number];
}

@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  constructor(private http: HttpClient) {}

  /**
    Metodo para obtener los paises desde la API RestCountries
   */
  getPaises(): Observable<Country[]> {
    // Obtener TODOS los países solo con nombre
    return this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name').pipe(
      map((paises: any[]) => {
        // Mapear solo los campos que necesitamos
        return paises.map(p => ({
          name: {
            common: p.name?.common || 'Desconocido'
          },
          ccn3: p.ccn3 || p.cca3 || 'XXX',
          region: p.region || 'Unknown',
          latlng: p.latlng || [0, 0]
        }));
      })
    );
  }


}