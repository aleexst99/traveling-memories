import { Component, OnInit, ElementRef, input, effect } from '@angular/core';
import * as L from 'leaflet';
import { User } from '@core/models/user.model';
import { Viaje } from '@core/models/viajes.model';

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

    this.map = L.map(this.el.nativeElement.querySelector('#map'), {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([20, 0], 2);

    // Tiles oscuros sin etiquetas — CartoDB Dark Matter No Labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    }).addTo(this.map);

    this.refrescarMarcadores();
  }

  private refrescarMarcadores() {
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    const u    = this.user();
    const todos = [...u.trips, ...u.wishlist];

    todos.forEach(trip => {
      if (!trip.lat || !trip.lng) return;
      const icon = this.buildIcon(trip);
      L.marker([trip.lat, trip.lng], { icon })
        .addTo(this.map)
        .bindPopup(this.buildPopup(trip), { maxWidth: 200 });
    });
  }

  private buildIcon(trip: Viaje): L.DivIcon {
    const color = trip.tipo === 'wishlist' ? '#6366f1' : '#10b981';
    const flag  = trip.flag_url
      ? `<img src="${trip.flag_url}" style="width:18px;height:12px;object-fit:cover;border-radius:2px;display:block;" />`
      : '';

    return L.divIcon({
      className: '',
      html: `
        <div style="
          display:flex;flex-direction:column;align-items:center;gap:2px;
          filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));">
          <div style="
            background:${color};
            border:2px solid white;
            border-radius:50% 50% 50% 0;
            width:28px;height:28px;
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;">
            <div style="transform:rotate(45deg);">${flag}</div>
          </div>
        </div>`,
      iconSize:   [28, 34],
      iconAnchor: [14, 34],
      popupAnchor:[0, -36],
    });
  }

  private buildPopup(trip: Viaje): string {
    const badge = trip.tipo === 'wishlist'
      ? `<span style="background:#6366f1;color:#fff;font-size:0.7rem;padding:1px 6px;border-radius:999px;">Wishlist</span>`
      : `<span style="background:#10b981;color:#fff;font-size:0.7rem;padding:1px 6px;border-radius:999px;">Visitado</span>`;

    const flag = trip.flag_url
      ? `<img src="${trip.flag_url}" style="width:24px;height:16px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:6px;" />`
      : '';

    return `
      <div style="font-family:sans-serif;min-width:140px;">
        <div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">
          ${flag}${trip.title}
        </div>
        <div style="color:#888;font-size:0.8rem;margin-bottom:6px;">${trip.continent}</div>
        ${badge}
      </div>`;
  }
}
