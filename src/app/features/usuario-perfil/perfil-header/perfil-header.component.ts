import { Component, computed, input, output, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-header.component.html',
  styleUrl: './perfil-header.component.scss'
})
export class PerfilHeaderComponent {
  user        = input.required<User>();
  userUpdated = output<User>();

  private api        = inject(ApiService);
  private cloudinary = inject(CloudinaryService);
  private toast      = inject(ToastService);
  auth               = inject(AuthService);
  private fb         = inject(FormBuilder);

  displayName  = computed(() => this.user().name.toUpperCase());
  modoOscuro   = signal(localStorage.getItem('tm_modo_oscuro') === 'true');
  editando     = signal(false);
  subiendoAvatar = signal(false);
  previewAvatar  = signal<string | null>(null);

  editForm = this.fb.group({
    name:       [''],
    bio:        [''],
    avatar_url: [''],
  });

  toggleModoOscuro() {
    this.modoOscuro.update(v => {
      localStorage.setItem('tm_modo_oscuro', String(!v));
      return !v;
    });
  }

  abrirEdicion() {
    const u = this.user();
    this.editForm.patchValue({ name: u.name, bio: u.bio, avatar_url: u.photo });
    this.previewAvatar.set(u.photo);
    this.editando.set(true);
  }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.previewAvatar.set(reader.result as string);
    reader.readAsDataURL(file);

    this.subiendoAvatar.set(true);
    this.cloudinary.upload(file).subscribe({
      next: (url) => {
        this.editForm.patchValue({ avatar_url: url });
        this.subiendoAvatar.set(false);
      },
      error: () => {
        this.toast.error('Error al subir la imagen.');
        this.subiendoAvatar.set(false);
      }
    });
  }

  guardarPerfil() {
    if (this.subiendoAvatar()) return;
    const raw = this.editForm.value;
    const u   = this.user();

    this.api.updateUser(u.id, {
      name:       raw.name       || u.name,
      bio:        raw.bio        ?? u.bio,
      avatar_url: raw.avatar_url || u.photo,
    }).subscribe({
      next: (updated) => {
        this.userUpdated.emit({ ...u, ...updated });
        this.editando.set(false);
        this.toast.error(''); // reset
      },
      error: () => this.toast.error('Error al guardar el perfil.')
    });
  }
}
