import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthController } from '../../../controllers/auth.controller';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [`
    .form-container {
      max-width: 400px; margin: 2rem auto; padding: 1.5rem;
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    input { width: 100%; padding: 0.6rem; margin: 0.5rem 0; box-sizing: border-box; }
    button { width: 100%; padding: 0.6rem; background: #3AAED8; color: white; border: none; border-radius: 4px; }
  `]
})
export class LoginComponent {
  constructor(private auth: AuthController, private router: Router) {}

  login(email: string, senha: string): void {
    this.auth.login(email, senha).subscribe({
      next: () => {
        const user = this.auth.getUser();
        if (user?.tipo === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user?.tipo === 'cliente-plus') {
          this.router.navigate(['/plus/chat']);
        } else {
          this.router.navigate(['/cliente/chat']);
        }
      },
      error: () => alert('Login falhou. Verifique suas credenciais.')
    });
  }
}