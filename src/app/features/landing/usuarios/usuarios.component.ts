import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import usersData from '../../../../assets/data/users.json';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {

  users: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.users = usersData;
  }

  openUserProfile(userId: number) {
    this.router.navigate(['/user', userId]);
  }

}
