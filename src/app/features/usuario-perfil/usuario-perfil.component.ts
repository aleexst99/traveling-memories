import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from './models/user.model';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss']
})
export class UsuarioPerfilComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  user: User | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.http.get<User[]>('../../../assets/data/users.json').subscribe(users => {
      this.user = users.find(u => u.id === id) ?? null;
    });
  }
}
