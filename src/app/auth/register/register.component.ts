import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthController } from '../../../controllers/auth.controller';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [`
    .form-container {
      max-width: 400px; margin: 2rem auto; padding: 1.5rem;
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    input[type="text"], input[type="email"], input[type="password"] {
      width: 100%; padding: 0.6rem; margin: 0.5rem 0; box-sizing: border-box;
    }
    label { display: block; margin: 0.5rem 0; }
    button { width: 100%; padding: 0.6rem; background: #3AAED8; color: white; border: none; border-radius: 4px; }
  `]
})
export class RegisterComponent {
  constructor(private auth: AuthController, private router: Router) {}

  register(nome: string, email: string, senha: string, isPlus: boolean): void {
    const tipo = isPlus ? 'cliente-plus' : 'cliente';
    this.auth.register(nome, email, senha, tipo).subscribe({
      next: () => {
        alert('Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro ao criar conta:', err);
        alert('Erro ao criar conta. Tente outro e-mail ou verifique os dados.');
      }
    });
  }
}