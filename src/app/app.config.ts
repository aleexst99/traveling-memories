import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LandingComponent } from './features/landing/landing.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: LandingComponent },

      // Perfil de usuario (lazy)
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./features/usuario-perfil/usuario-perfil.component')
            .then(m => m.UsuarioPerfilComponent),
        children: [
          {
            path: 'viajes',
            loadComponent: () =>
              import('./features/usuario-perfil/viajes/viajes-lista/viajes-lista.component')
                .then(m => m.ViajesListaComponent)
          },
          {
            path: 'viaje/:viajeId',
            loadComponent: () =>
              import('./features/usuario-perfil/viajes/viaje-detalle/viaje-detalle.component')
                .then(m => m.ViajeDetalleComponent)
          },
          {
            path: 'viajes/:id/entradas',
            loadComponent: () => import('./features/usuario-perfil/viajes/viaje-entrada/viaje-entrada.component').then(m => m.ViajeEntradaComponent )
          },
        ]
      },

      // Mapa global (lazy)
      {
        path: 'mapa-global',
        loadComponent: () =>
          import('./features/mapa-global/mapa-global.component')
            .then(m => m.MapaGlobalComponent)
      },

      { path: '**', redirectTo: '' }
    ]),
    provideHttpClient()
  ]
};
