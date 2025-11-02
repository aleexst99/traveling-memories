import { Component, computed, input, Input, signal } from '@angular/core';
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

   // ✅ Señal para controlar modo visual (por ejemplo, más adelante)
   modoOscuro = signal(false);

   toggleModoOscuro() {
     this.modoOscuro.update(v => !v);
   }

}
