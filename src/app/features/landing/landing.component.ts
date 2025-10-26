import { UsuariosComponent } from './usuarios/usuarios.component';
import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { DescriptionComponent } from './description/description.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, DescriptionComponent, UsuariosComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
}
