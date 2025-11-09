import { Component, computed, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViajeCardComponent } from '../viaje-card/viaje-card.component';
import { Viaje } from '../../viajes/models/viajes.model';


@Component({
  selector: 'app-viajes-lista-dos',
  standalone: true,
  imports: [CommonModule, ViajeCardComponent],
  templateUrl: './viajes-lista.component.html',
  styleUrls: ['./viajes-lista.component.scss']
})
export class ViajesListaComponentDos {
  viajes = input<Viaje[]>([]);
  wishlist = input<Viaje[]>([]);

  totalViajes = computed(() => this.viajes().length);
  totalWishlist = computed(() => this.wishlist().length);
}
