import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { User } from '../../usuario-perfil/models/user.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  users: User[] = [];

  ngOnInit() {
    this.api.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('Error cargando usuarios:', err),
    });
  }

  openUserProfile(userId: number) {
    this.router.navigate(['/user', userId]);
  }
}
