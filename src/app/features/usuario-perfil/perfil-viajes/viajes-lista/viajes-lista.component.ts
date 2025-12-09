import { Component, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ViajeCardComponent } from '../viaje-card/viaje-card.component';
import { Viaje } from '../../viajes/models/viajes.model';

@Component({
  selector: 'app-viajes-lista',
  standalone: true,
  imports: [CommonModule, ViajeCardComponent],
  templateUrl: './viajes-lista.component.html',
  styleUrls: ['./viajes-lista.component.scss']
})
export class ViajesListaComponentDos {
  private router = inject(Router);

  viajes = input<Viaje[]>([]);
  wishlist = input<Viaje[]>([]);

  totalViajes = computed(() => this.viajes().length);
  totalWishlist = computed(() => this.wishlist().length);

  onViajeSelected(viajeId: string) {
    this.router.navigate(['/viajes', viajeId, 'entradas']);
  }
}