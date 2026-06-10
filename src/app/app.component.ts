import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { BackButtonComponent } from './shared/back-button/back-button.component';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, BackButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'travel-blog';
  // Inyectar ThemeService para que se inicialice al arrancar la app
  // y aplique la clase correcta en <html> antes del primer render
  readonly theme = inject(ThemeService);
}
