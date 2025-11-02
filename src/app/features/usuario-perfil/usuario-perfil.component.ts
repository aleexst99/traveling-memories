import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { User } from './models/user.model';
import { PerfilDashboardComponent } from './perfil-dashboard/perfil-dashboard.component';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';
import { PerfilMapaComponent } from './perfil-mapa/perfil-mapa.component';
import { ViajesListaComponent } from './viajes/viajes-lista/viajes-lista.component';
import { Viaje } from './viajes/models/viajes.model';
import { ViajesListaComponentDos } from './perfil-viajes/viajes-lista/viajes-lista.component';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PerfilHeaderComponent,
    PerfilDashboardComponent,
    ViajesListaComponent,
    PerfilMapaComponent,
    CommonModule, ViajesListaComponentDos],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss']
})
export class UsuarioPerfilComponent {
  // --- Dependencias
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  // --- Signals base
  user = signal<User | null>(null);
  continentes = signal(['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía']);
  filtroContinente = signal('Todos');

  // --- Datos derivados con computed()
  viajesRealizados = computed(() => this.user()?.trips.length ?? 0);
  viajesWishlist = computed(() => this.user()?.wishlist.length ?? 0);

  porcentajeContinentes = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const visitados = new Set(u.trips.map((v) => v.continent)).size;
    return Math.round((visitados / (this.continentes().length - 1)) * 100);
  });

  viajesFiltrados = computed<Viaje[]>(() => {
    const u = this.user();
    const filtro = this.filtroContinente();
    if (!u) return [];
    if (filtro === 'Todos') return u.trips;
    return u.trips.filter((v) => v.continent === filtro);
  });

  // --- Constructor reactivo
  constructor() {
    // Cuando cambia la ruta → recarga usuario
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.cargarUsuario(id);
    });
  }

  // --- Cargar datos desde JSON
  private cargarUsuario(id: number) {
    this.http.get<User[]>('assets/data/users.json').subscribe({
      next: (users) => {
        const found = users.find((u) => u.id === id) ?? null;
        this.user.set(found);
      },
      error: (err) => console.error('Error cargando usuario:', err),
    });
  }

  // --- Acciones de usuario
  abrirModal = () => alert('Aquí se abriría el modal para añadir un viaje');

  filtrarPorContinente = (continent: string) => this.filtroContinente.set(continent);
}