import { Component, OnInit, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { User } from '../usuario-perfil/models/user.model';
import { Viaje } from '../usuario-perfil/viajes/models/viajes.model';
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

  users = signal<User[]>([]);
  allTrips = signal<Viaje[]>([]);
  filtroUsuario = signal<string>('Todos');
  filtroContinente = signal<string>('Todos');

  continentes = ['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía'];

  filteredTrips = computed(() => {
    const userFilter = this.filtroUsuario();
    const contFilter = this.filtroContinente();

    return this.allTrips().filter(v => {
      const matchCont = contFilter === 'Todos' || v.continent === contFilter;
      const matchUser = userFilter === 'Todos' || v.id_user === Number(userFilter);
      return matchCont && matchUser;
    });
  });



  constructor(private http: HttpClient, private el: ElementRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos() {
    this.http.get<User[]>('../../../assets/data/users.json').subscribe({
      next: (users) => {
        this.users.set(users);
        const trips = users.flatMap(u =>
          u.trips.map(t => ({ ...t,    id_user: u.id,     // ← AÑADIR esto
            userName: u.name,
            userPhoto: u.photo }))
        );
        this.allTrips.set(trips);
        this.initMap(trips);
      },
      error: (err) => console.error('Error cargando datos', err)
    });
  }

  private initMap(trips: Viaje[]) {
    if (this.map) return;
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
    (this.map as any)._layers &&
      Object.values((this.map as any)._layers).forEach((layer: any) => {
        if (layer instanceof L.Marker) this.map.removeLayer(layer);
      });

    this.filteredTrips().forEach(v => {
      if (v.lat && v.lng) {
        const user = this.users().find(u => u.id === v.id_user);
        const icon = L.icon({
          iconUrl: 'assets/marker-icon.png', // marcador por defecto
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -35],
          shadowUrl: 'assets/marker-shadow.png'
        });

        L.marker([v.lat, v.lng], { icon })
          .addTo(this.map)
          .bindPopup(`
            <b>${v.title}</b><br>
            ${v.continent}<br>
            <img src="${user?.photo}" style="width:30px;border-radius:50%;" /><br>
            <small>${user?.name}</small>
          `);
      }
    });
  }


  onFilterChange() {
    this.refrescarMarcadores();
  }
}
