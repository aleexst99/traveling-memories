import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { User } from './models/user.model';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';
import { PerfilMapaComponent } from './perfil-mapa/perfil-mapa.component';
import { Viaje } from './viajes/models/viajes.model';
import { ViajesListaComponentDos } from './perfil-viajes/viajes-lista/viajes-lista.component';
import { ViajeFormComponent } from './viaje-form/viaje-form.component';
import { StorageService } from '../../core/storage.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PerfilHeaderComponent,
    PerfilMapaComponent,
    CommonModule, ViajesListaComponentDos, ViajeFormComponent],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss']
})
export class UsuarioPerfilComponent {
  // --- Dependencias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  auth = inject(AuthService);

  // --- Signals base
  user = signal<User | null>(null);
  continentes = signal(['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía']);
  filtroContinente = signal('Todos');

  // --- Datos derivados con computed()
  viajesRealizados = computed(() => this.user()?.trips.length ?? 0);
  viajesWishlist = computed(() => this.user()?.wishlist.length ?? 0);

  mostrarModal = false;

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

  // --- Cargar datos: JSON como fuente inicial, localStorage como fuente de verdad
  private cargarUsuario(id: number) {
    this.http.get<User[]>('assets/data/users.json').subscribe({
      next: (users) => {
        const found = users.find((u) => u.id === id);
        if (!found) { this.user.set(null); return; }

        if (!this.storage.isUserSeeded(id)) {
          this.storage.seedUser(id, found.trips ?? [], found.wishlist ?? []);
        }

        const viajes = this.storage.getViajesByUser(id);
        const trips = viajes.filter(v => v.tipo === 'realizado');
        const wishlist = viajes.filter(v => v.tipo === 'wishlist');

        this.user.set({ ...found, trips, wishlist });
      },
      error: (err) => console.error('Error cargando usuario:', err),
    });
  }

  // --- Acciones de usuario
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  onViajeGuardado(viaje: Viaje) {
    this.storage.saveViaje(viaje);
    this.cerrarModal();
    const userId = this.user()?.id;
    if (userId) {
      const viajes = this.storage.getViajesByUser(userId);
      this.user.update(u => u ? {
        ...u,
        trips: viajes.filter(v => v.tipo === 'realizado'),
        wishlist: viajes.filter(v => v.tipo === 'wishlist'),
      } : null);
    }
    this.router.navigate(['/user', viaje.id_user, 'viaje', viaje.id]);
  }


  filtrarPorContinente = (continent: string) => this.filtroContinente.set(continent);
}