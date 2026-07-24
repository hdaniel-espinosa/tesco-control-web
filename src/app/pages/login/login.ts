import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  readonly usuario = signal('');
  readonly contrasena = signal('');
  readonly ingresando = signal(false);

  ingresar(): void {
    this.ingresando.set(true);
    this.authService.login(this.usuario(), this.contrasena()).subscribe({
      next: (username) => {
        this.ingresando.set(false);
        this.toastr.success(`Bienvenido, ${username}`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.ingresando.set(false);
        this.toastr.error('Usuario o contraseña incorrectos');
      }
    });
  }
}
