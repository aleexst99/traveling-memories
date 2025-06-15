import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LandingComponent } from './features/landing/landing.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { UsuarioPerfilComponent } from './features/usuarios/usuario-perfil/usuario-perfil.component';
import { ViajesListaComponent } from './features/viajes/viajes-lista/viajes-lista.component';
import { ViajeDetalleComponent } from './features/viajes/viaje-detalle/viaje-detalle.component';
import { ViajeEntradaComponent } from './features/viajes/viaje-entrada/viaje-entrada.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: LandingComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'usuarios/:id', component: UsuarioPerfilComponent },
      { path: 'usuarios/:id/viajes', component: ViajesListaComponent },
      { path: 'viajes/:viajeId', component: ViajeDetalleComponent },
      { path: 'viajes/:viajeId/entrada/:entradaId', component: ViajeEntradaComponent },
    ]),
    provideHttpClient()
  ]
};
