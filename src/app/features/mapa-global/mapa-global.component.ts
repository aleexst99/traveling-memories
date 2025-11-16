import { Component, ElementRef, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { User } from '../usuario-perfil/models/user.model';
import { ViajeConUsuario } from '../usuario-perfil/viajes/models/viajes.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mapa-global',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-global.component.html',
  styleUrls: ['./mapa-global.component.scss']
})
export class MapaGlobalComponent implements OnInit {

  private map!: L.Map;

  usuarios = signal<User[]>([]);
  allTrips = signal<ViajeConUsuario[]>([]);

  filtroUsuario = signal<string>('Todos');
  filtroContinente = signal<string>('Todos');

  continentes = ['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía'];

  filteredTrips = computed(() => {
    return this.allTrips().filter(v => {
      const matchUser = this.filtroUsuario() === 'Todos' || v.userName === this.filtroUsuario();
      const matchCont = this.filtroContinente() === 'Todos' || v.continent === this.filtroContinente();
      return matchUser && matchCont;
    });
  });

  constructor(private http: HttpClient, private el: ElementRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos() {
    this.http.get<User[]>('assets/data/users.json').subscribe({
      next: users => {
        this.usuarios.set(users);

        const trips: ViajeConUsuario[] = [];

        users.forEach(u => {
          u.trips.forEach(t => trips.push({ ...t, userName: u.name, userPhoto: u.photo, tipo: 'realizado' }));
          u.wishlist.forEach(w => trips.push({ ...w, userName: u.name, userPhoto: u.photo, tipo: 'wishlist' }));
        });

        this.allTrips.set(trips);

        setTimeout(() => this.initMap(), 0);
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  private initMap() {
    this.map = L.map(this.el.nativeElement.querySelector('#map')).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.refrescarMarcadores();
  }

  refrescarMarcadores() {
    if (!this.map) return;

    // Limpiar marcadores previos
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    this.filteredTrips().forEach(v => {
      if (v.lat && v.lng) {
        const icon = this.crearIconoFA(v.tipo, v.userName);
        L.marker([v.lat, v.lng], { icon })
          .addTo(this.map)
          .bindPopup(`
            <b>${v.title}</b><br>
            ${v.continent}<br>
            <img src="${v.userPhoto}" style="width:30px;border-radius:50%;" /><br>
            <small>${v.userName}</small>
          `);
      }
    });
  }

  private crearIconoFA(tipo: 'realizado' | 'wishlist', userName: string): L.DivIcon {
    // Color por usuario
    const color = userName === 'Alejandro' ? '#007bff' : '#28a745';
    // Icono por tipo
    const faIcon = tipo === 'wishlist' ? 'fa-star' : 'fa-plane';

    const html = `<i class="fa ${faIcon}" style="color:${color}; font-size: 24px;"></i>`;

    return L.divIcon({
      html,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }

  onFilterChange() {
    this.refrescarMarcadores();
  }
}
