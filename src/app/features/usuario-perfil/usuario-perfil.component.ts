import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { User } from '@core/models/user.model';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';
import { PerfilMapaComponent } from './perfil-mapa/perfil-mapa.component';
import { Viaje } from '@core/models/viajes.model';
import { ViajesListaComponent } from './perfil-viajes/viajes-lista/viajes-lista.component';
import { ViajeFormComponent } from './viaje-form/viaje-form.component';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [PerfilHeaderComponent, PerfilMapaComponent, ViajesListaComponent, ViajeFormComponent],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss']
})
export class UsuarioPerfilComponent {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(ApiService);
  private toast  = inject(ToastService);
  auth           = inject(AuthService);

  user           = signal<User | null>(null);
  cargando       = signal(true);
  errorCarga     = signal(false);
  continentes    = signal(['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía']);
  filtroContinente = signal('Todos');
  mostrarModal   = false;

  viajesRealizados = computed(() => this.user()?.trips.length ?? 0);
  viajesWishlist   = computed(() => this.user()?.wishlist.length ?? 0);

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

    forkJoin({
      user:   this.api.getUser(id),
      viajes: this.api.getTripsByUser(id),
    }).subscribe({
      next: ({ user, viajes }) => {
        this.user.set({
          ...user,
          trips:    viajes.filter(v => v.tipo === 'realizado'),
          wishlist: viajes.filter(v => v.tipo === 'wishlist'),
        });
        this.cargando.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar el perfil. Inténtalo de nuevo.');
        this.cargando.set(false);
        this.errorCarga.set(true);
      },
    });
  }

  abrirModal()  { this.mostrarModal = true;  }
  cerrarModal() { this.mostrarModal = false; }

  onViajeGuardado(viaje: Viaje) {
    this.api.createTrip(viaje).subscribe({
      next: (viajeCreado) => {
        this.cerrarModal();
        // Actualiza el signal local sin volver a pedir todo el perfil
        this.user.update(u => {
          if (!u) return null;
          const todos = [...u.trips, ...u.wishlist, viajeCreado];
          return {
            ...u,
            trips:    todos.filter(v => v.tipo === 'realizado'),
            wishlist: todos.filter(v => v.tipo === 'wishlist'),
          };
        });
        this.router.navigate(['/user', viajeCreado.id_user, 'viaje', viajeCreado.id]);
      },
      error: () => this.toast.error('Error al crear el viaje. Inténtalo de nuevo.'),
    });
  }

  reintentarCarga() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.cargarUsuario(id);
  }

  onUserUpdated(updated: User) {
    this.user.update(u => u ? { ...u, name: updated.name, bio: updated.bio, photo: updated.photo } : null);
  }

  filtrarPorContinente = (continent: string) => this.filtroContinente.set(continent);
}
