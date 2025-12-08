import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  private url = 'https://restcountries.com/v3.1/all';

  constructor(private http: HttpClient) {}

  getPaises(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
}
