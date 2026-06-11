import { Component, input, output, computed } from '@angular/core';
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

  /** Número de entradas pasado por el padre — evita N+1 al store/API */
  numEntradas  = input(0);
  ultimaFecha  = input<string | undefined>(undefined);

  onCardClick() {
    this.viajeClick.emit(this.viaje().id.toString());
  }
}
