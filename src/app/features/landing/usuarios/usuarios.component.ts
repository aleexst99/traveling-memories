import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  users: User[] = [];

  ngOnInit() {
    this.api.getUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.toast.error('No se pudieron cargar los usuarios. Inténtalo de nuevo.'),
    });
  }

  openUserProfile(userId: number) {
    this.router.navigate(['/user', userId]);
  }
}
