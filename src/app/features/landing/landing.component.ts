import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { DescriptionComponent } from './description/description.component';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent,DescriptionComponent,UsersComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}
