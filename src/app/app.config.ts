import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LandingComponent } from './features/landing/landing.component';
import { UsuariosComponent } from './features/landing/usuarios/usuarios.component';
import { UsuarioPerfilComponent } from './features/usuario-perfil/usuario-perfil.component';
import { ViajesListaComponent } from './features/usuario-perfil/viajes/viajes-lista/viajes-lista.component';
import { ViajeDetalleComponent } from './features/usuario-perfil/viajes/viaje-detalle/viaje-detalle.component';
import { ViajeEntradaComponent } from './features/usuario-perfil/viajes/viaje-entrada/viaje-entrada.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: LandingComponent },
      { path: 'usuarios', component: UsuariosComponent },
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./features/usuario-perfil/usuario-perfil.component').then(m => m.UsuarioPerfilComponent)
      },
      { path: 'usuarios/:id/viajes', component: ViajesListaComponent },
      { path: 'viajes/:viajeId', component: ViajeDetalleComponent },
      { path: 'viajes/:viajeId/entrada/:entradaId', component: ViajeEntradaComponent },
    ]),
    provideHttpClient()
  ]
};
