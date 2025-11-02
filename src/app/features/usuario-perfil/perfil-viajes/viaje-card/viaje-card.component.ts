import { Component, input, Input } from '@angular/core';
import { Viaje } from '../../viajes/models/viajes.model';

@Component({
  selector: 'app-viaje-card',
  standalone: true,
  imports: [],
  templateUrl: './viaje-card.component.html',
  styleUrl: './viaje-card.component.scss'
})
export class ViajeCardComponent {
  viaje = input.required<Viaje>();
  wishlist = input(false);

}
