import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm  = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  cargando = false;
  errorMsg = '';

  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(3)]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  get nameError(): string {
    const c = this.form.get('name');
    if (!c?.dirty) return '';
    if (c.hasError('required'))   return 'El nombre es obligatorio.';
    if (c.hasError('minlength'))  return 'Mínimo 3 caracteres.';
    return '';
  }

  get passwordError(): string {
    const c = this.form.get('password');
    if (!c?.dirty) return '';
    if (c.hasError('required'))  return 'La contraseña es obligatoria.';
    if (c.hasError('minlength')) return 'Mínimo 6 caracteres.';
    return '';
  }

  get confirmError(): string {
    if (!this.form.get('confirmPassword')?.dirty) return '';
    return this.form.hasError('passwordsMismatch') ? 'Las contraseñas no coinciden.' : '';
  }

  submit() {
    if (this.form.invalid || this.cargando) return;
    this.cargando = true;
    this.errorMsg = '';

    const { name, password } = this.form.value;

    this.api.register({ name: name!, password: password! }).subscribe({
      next: (user) => {
        this.auth.setUser({ username: user.name, userId: user.id });
        this.toast.success('Cuenta creada. ¡Bienvenido!');
        this.router.navigate(['/user', user.id]);
      },
      error: (err) => {
        this.cargando = false;
        const detail = err?.error?.detail;
        if (typeof detail === 'string') {
          this.errorMsg = detail;
        } else {
          this.errorMsg = 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        }
      },
    });
  }
}
