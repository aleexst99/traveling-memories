import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../models/user.model';

@Component({
  selector: 'app-perfil-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './perfil-dashboard.component.html',
  styleUrl: './perfil-dashboard.component.scss'
})
export class PerfilDashboardComponent {
  @Input() user!: User;
  @Input() continentes: string[] = [];
  @Output() filtroChange = new EventEmitter<string>();

  filtroContinente = 'Todos';

  abrirModal() {
    alert('Aquí se abrirá el modal para añadir un viaje');
  }

  onFiltrar(continente: string) {
    this.filtroContinente = continente;
    this.filtroChange.emit(continente);
  }

  get viajesRealizados() {
    return this.user?.trips?.length ?? 0;
  }

  get viajesWishlist() {
    return this.user?.wishlist?.length ?? 0;
  }

  get porcentajeContinentes() {
    if (!this.user?.trips?.length) return 0;
    const visitados = new Set(this.user.trips.map((v) => v.continent)).size;
    return Math.round((visitados / this.continentes.length) * 100);
  }
}


