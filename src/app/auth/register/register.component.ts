import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    button { width: 100%; padding: 0.6rem; background: #3AAED8; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { opacity: 0.9; }
  `]
})
export class RegisterComponent {
  
  nome: string = '';
  email: string = '';
  senha: string = '';
  isPlus: boolean = false;

  constructor(private auth: AuthController, private router: Router) {}

  register(): void {
    // CORREÇÃO AQUI:
    // 1. Criamos uma variável que define o tipo com base no checkbox
    const tipoUsuario = this.isPlus ? 'premium' : 'basic';

    // 2. Passamos essa variável 'tipoUsuario' no lugar onde estava o ""User""
    this.auth.register(this.nome, this.email, this.senha, tipoUsuario).subscribe({
      next: () => {
        alert('Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Erro:', err);
        alert('Erro ao criar conta.');
      }
    });
  }
}