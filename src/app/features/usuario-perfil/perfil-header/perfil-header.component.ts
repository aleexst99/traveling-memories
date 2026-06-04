import { Component, computed, input, signal } from '@angular/core';
import { User } from '../models/user.model';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [],
  templateUrl: './perfil-header.component.html',
  styleUrl: './perfil-header.component.scss'
})
export class PerfilHeaderComponent {
   // ✅ Señal de entrada: usuario actual
   user = input.required<User>();

   // ✅ Señal derivada: nombre en mayúsculas para mostrar bonito
   displayName = computed(() => this.user().name.toUpperCase());

   modoOscuro = signal(localStorage.getItem('tm_modo_oscuro') === 'true');

   toggleModoOscuro() {
     this.modoOscuro.update(v => {
       localStorage.setItem('tm_modo_oscuro', String(!v));
       return !v;
     });
   }

}
