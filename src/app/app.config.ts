import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LandingComponent } from './features/landing/landing.component';


export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: LandingComponent },
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./features/usuario-perfil/usuario-perfil.component').then(m => m.UsuarioPerfilComponent)
      },
      {
        path: 'mapa-global',
        loadComponent: () =>
          import('./features/mapa-global/mapa-global.component').then(m => m.MapaGlobalComponent)
      },
      {
        path: 'usuarios/:id/viajes',
        loadComponent: () =>
          import('./features/usuario-perfil/viajes/viajes-lista/viajes-lista.component').then(m => m.ViajesListaComponent)
      },
      {
        path: 'viajes/:viajeId',
        loadComponent: () =>
          import('./features/usuario-perfil/viajes/viaje-detalle/viaje-detalle.component').then(m => m.ViajeDetalleComponent)
      },
      {
        path: 'viajes/:viajeId/entrada/:entradaId',
        loadComponent: () =>
          import('./features/usuario-perfil/viajes/viaje-entrada/viaje-entrada.component').then(m => m.ViajeEntradaComponent)
      },
      { path: '**', redirectTo: '' }
    ]),
    provideHttpClient()
  ]
};
