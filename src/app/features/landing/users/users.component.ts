import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CardModule],
  templateUrl: './users.component.html',
})
export class UsersComponent {}
