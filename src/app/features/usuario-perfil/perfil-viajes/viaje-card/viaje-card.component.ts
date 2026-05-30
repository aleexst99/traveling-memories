import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Viaje } from '../../viajes/models/viajes.model';
import { StorageService } from '../../../../core/storage.service';

@Component({
  selector: 'app-viaje-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viaje-card.component.html',
  styleUrl: './viaje-card.component.scss'
})
export class ViajeCardComponent {
  private storage = inject(StorageService);

  viaje = input.required<Viaje>();
  wishlist = input(false);

  viajeClick = output<string>();

  entradas = computed(() => this.storage.getEntradas(this.viaje().id));
  ultimaEntrada = computed(() => {
    const list = this.entradas();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  onCardClick() {
    this.viajeClick.emit(this.viaje().id.toString());
  }
}
