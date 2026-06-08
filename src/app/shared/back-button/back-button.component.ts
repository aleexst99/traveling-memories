import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Rutas en las que el botón NO aparece (puntos de entrada)
const HIDDEN_ROUTES = ['/', '/login', '/mapa-global'];

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);

  visible = signal(false);

  ngOnInit() {
    // Recalcula visibilidad en cada cambio de ruta
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.visible.set(!HIDDEN_ROUTES.includes(e.urlAfterRedirects));
    });
  }

  goBack() {
    this.location.back();
  }
}
