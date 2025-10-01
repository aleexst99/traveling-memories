import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { UsersComponent } from './features/landing/users/users.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'users',
    component: UsersComponent
  }
];
