import { Component, OnInit, ElementRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { User } from '../models/user.model';

@Component({
  selector: 'app-perfil-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-mapa.component.html',
  styleUrls: ['./perfil-mapa.component.scss']
})
export class PerfilMapaComponent implements OnInit {
  user = input.required<User>();
  private map!: L.Map;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  private initMap() {
    if (this.map) return;
    this.map = L.map(this.el.nativeElement.querySelector('#map')).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.user().trips.forEach((trip) => {
      if (trip.lat && trip.lng) {
        L.marker([trip.lat, trip.lng])
          .addTo(this.map)
          .bindPopup(`<b>${trip.title}</b><br>${trip.continent}`);
      }
    });
  }
}
