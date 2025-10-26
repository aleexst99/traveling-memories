import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { DescriptionComponent } from './description/description.component';
import { UsersComponent } from './users/users.component';
import {LeafletMapComponent } from '../../leaflet-map/leaflet-map.component'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, DescriptionComponent, UsersComponent, LeafletMapComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
}
