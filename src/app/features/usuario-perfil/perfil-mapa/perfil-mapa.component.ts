import { Component, OnInit, ElementRef, input, effect } from '@angular/core';
import * as L from 'leaflet';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-perfil-mapa',
  standalone: true,
  imports: [],
  templateUrl: './perfil-mapa.component.html',
  styleUrls: ['./perfil-mapa.component.scss']
})
export class PerfilMapaComponent implements OnInit {
  user = input.required<User>();
  private map!: L.Map;

  constructor(private el: ElementRef) {
    effect(() => {
      const u = this.user();
      if (this.map && u) this.refrescarMarcadores();
    });
  }

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
    this.refrescarMarcadores();
  }

  private refrescarMarcadores() {
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    const u = this.user();
    const todos = [...u.trips, ...u.wishlist];

    todos.forEach(trip => {
      if (trip.lat && trip.lng) {
        const color = trip.tipo === 'wishlist' ? '#6366f1' : '#10b981';
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:12px;height:12px;border-radius:50%;
            background:${color};border:2px solid white;
            box-shadow:0 0 4px rgba(0,0,0,.4)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([trip.lat, trip.lng], { icon })
          .addTo(this.map)
          .bindPopup(`<b>${trip.title}</b><br><small>${trip.continent}</small>`);
      }
    });
  }
}
