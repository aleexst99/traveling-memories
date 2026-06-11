import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Viaje } from '@core/models/viajes.model';

@Component({
  selector: 'app-viaje-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './viaje-card.component.html',
  styleUrl: './viaje-card.component.scss'
})
export class ViajeCardComponent {
  viaje    = input.required<Viaje>();
  wishlist = input(false);

  viajeClick = output<string>();

  onCardClick() {
    this.viajeClick.emit(this.viaje().id.toString());
  }
}
