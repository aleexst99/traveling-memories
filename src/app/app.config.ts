import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LandingComponent } from './features/landing/landing.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: LandingComponent },

      // Perfil de usuario
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./features/usuario-perfil/usuario-perfil.component')
            .then(m => m.UsuarioPerfilComponent)
      },

      // Detalle de viaje
      {
        path: 'user/:id/viaje/:viajeId',
        loadComponent: () =>
          import('./features/usuario-perfil/viajes/viaje-detalle/viaje-detalle.component')
            .then(m => m.ViajeDetalleComponent)
      },

      // Nueva entrada de viaje
      {
        path: 'user/:id/viajes/:viajeId/entradas',
        loadComponent: () =>
          import('./features/usuario-perfil/viajes/viaje-entrada/viaje-entrada.component')
            .then(m => m.ViajeEntradaComponent)
      },

      // Mapa global (lazy)
      {
        path: 'mapa-global',
        loadComponent: () =>
          import('./features/mapa-global/mapa-global.component')
            .then(m => m.MapaGlobalComponent)
      },

      // Login
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login.component').then(m => m.LoginComponent)
      },

      { path: '**', redirectTo: '' }
    ]),
    provideHttpClient()
  ]
};
