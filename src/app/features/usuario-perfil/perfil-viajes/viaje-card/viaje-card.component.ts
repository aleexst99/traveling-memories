import { Component, input, output, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Viaje } from '@core/models/viajes.model';
import { TripStoreService } from '@core/services/trip-store.service';

@Component({
  selector: 'app-viaje-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './viaje-card.component.html',
  styleUrl: './viaje-card.component.scss'
})
export class ViajeCardComponent {
  private store = inject(TripStoreService);

  viaje = input.required<Viaje>();
  wishlist = input(false);

  viajeClick = output<string>();

  entradas = computed(() => this.store.getEntriesByTrip(this.viaje().id));
  ultimaEntrada = computed(() => {
    const list = this.entradas();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  onCardClick() {
    this.viajeClick.emit(this.viaje().id.toString());
  }
}
