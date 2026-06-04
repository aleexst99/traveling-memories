import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './models/user.model';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';
import { PerfilMapaComponent } from './perfil-mapa/perfil-mapa.component';
import { Viaje } from './viajes/models/viajes.model';
import { ViajesListaComponentDos } from './perfil-viajes/viajes-lista/viajes-lista.component';
import { ViajeFormComponent } from './viaje-form/viaje-form.component';
import { ApiService } from '../../core/api.service';
import { TripStoreService } from '../../core/trip-store.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PerfilHeaderComponent,
    PerfilMapaComponent, ViajesListaComponentDos, ViajeFormComponent],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss']
})
export class UsuarioPerfilComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private store = inject(TripStoreService);
  auth = inject(AuthService);

  user = signal<User | null>(null);
  cargando = signal(true);
  errorCarga = signal(false);
  continentes = signal(['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía']);
  filtroContinente = signal('Todos');
  mostrarModal = false;

  viajesRealizados = computed(() => this.user()?.trips.length ?? 0);
  viajesWishlist = computed(() => this.user()?.wishlist.length ?? 0);

  porcentajeContinentes = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const visitados = new Set(u.trips.map(v => v.continent)).size;
    return Math.round((visitados / (this.continentes().length - 1)) * 100);
  });

  viajesFiltrados = computed<Viaje[]>(() => {
    const u = this.user();
    const filtro = this.filtroContinente();
    if (!u) return [];
    if (filtro === 'Todos') return u.trips;
    return u.trips.filter(v => v.continent === filtro);
  });

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.cargarUsuario(id);
    });
  }

  private cargarUsuario(id: number) {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.api.getUser(id).subscribe({
      next: (userBase) => {
        const viajes = this.store.getTripsByUser(id);
        this.user.set({
          ...userBase,
          trips: viajes.filter(v => v.tipo === 'realizado'),
          wishlist: viajes.filter(v => v.tipo === 'wishlist'),
        });
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuario:', err);
        this.cargando.set(false);
        this.errorCarga.set(true);
      },
    });
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  onViajeGuardado(viaje: Viaje) {
    this.api.createTrip(viaje).subscribe({
      next: (viajeCreado) => {
        this.store.addOrUpdateTrip(viajeCreado);
        this.cerrarModal();
        const userId = this.user()?.id;
        if (userId) {
          const viajes = this.store.getTripsByUser(userId);
          this.user.update(u => u ? {
            ...u,
            trips: viajes.filter(v => v.tipo === 'realizado'),
            wishlist: viajes.filter(v => v.tipo === 'wishlist'),
          } : null);
        }
        this.router.navigate(['/user', viajeCreado.id_user, 'viaje', viajeCreado.id]);
      },
      error: (err) => console.error('Error creando viaje:', err),
    });
  }

  reintentarCarga() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.cargarUsuario(id);
  }

  filtrarPorContinente = (continent: string) => this.filtroContinente.set(continent);
}
