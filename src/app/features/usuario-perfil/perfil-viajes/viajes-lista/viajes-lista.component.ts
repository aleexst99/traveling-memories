import { Component, computed, input, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ViajeCardComponent } from '@features/usuario-perfil/perfil-viajes/viaje-card/viaje-card.component';
import { Viaje } from '@core/models/viajes.model';

@Component({
  selector: 'app-viajes-lista',
  standalone: true,
  imports: [ViajeCardComponent],
  templateUrl: './viajes-lista.component.html',
  styleUrls: ['./viajes-lista.component.scss']
})
export class ViajesListaComponent implements OnDestroy {
  private router = inject(Router);
  private resizeHandler = () => this.adjustItemsPerPage();

  userId = input<number>(0);
  viajes = input<Viaje[]>([]);
  wishlist = input<Viaje[]>([]);

  totalViajes = computed(() => this.viajes().length);
  totalWishlist = computed(() => this.wishlist().length);

  // Carrusel
  currentSlideViajes = signal(0);
  currentSlideWishlist = signal(0);
  itemsPorPagina = signal(3);

  // Dots de los indicadores como computed signals (evita exponer Array/Math en el template)
  dotsViajes = computed(() =>
    Array.from({ length: Math.ceil(this.viajes().length / this.itemsPorPagina()) })
  );
  dotsWishlist = computed(() =>
    Array.from({ length: Math.ceil(this.wishlist().length / this.itemsPorPagina()) })
  );

  constructor() {
    // Ajustar items por página según tamaño de pantalla
    this.adjustItemsPerPage();
    window.addEventListener('resize', this.resizeHandler);
  }

  private adjustItemsPerPage() {
    if (window.innerWidth < 768) {
      this.itemsPorPagina.set(1); // Móvil: 1 card
    } else if (window.innerWidth < 1024) {
      this.itemsPorPagina.set(2); // Tablet: 2 cards
    } else {
      this.itemsPorPagina.set(3); // Desktop: 3 cards
    }
  }

  nextSlide(tipo: 'viajes' | 'wishlist') {
    if (tipo === 'viajes') {
      const max = this.viajes().length - this.itemsPorPagina();
      if (this.currentSlideViajes() < max) {
        this.currentSlideViajes.update(v => v + 1);
      }
    } else {
      const max = this.wishlist().length - this.itemsPorPagina();
      if (this.currentSlideWishlist() < max) {
        this.currentSlideWishlist.update(v => v + 1);
      }
    }
  }

  prevSlide(tipo: 'viajes' | 'wishlist') {
    if (tipo === 'viajes') {
      if (this.currentSlideViajes() > 0) {
        this.currentSlideViajes.update(v => v - 1);
      }
    } else {
      if (this.currentSlideWishlist() > 0) {
        this.currentSlideWishlist.update(v => v - 1);
      }
    }
  }

  goToSlide(tipo: 'viajes' | 'wishlist', index: number) {
    if (tipo === 'viajes') {
      this.currentSlideViajes.set(index);
    } else {
      this.currentSlideWishlist.set(index);
    }
  }

  onViajeSelected(viajeId: string) {
    this.router.navigate(['/user', this.userId(), 'viaje', viajeId]);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}