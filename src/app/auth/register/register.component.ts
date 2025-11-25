import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  
  nome: string = '';
  email: string = '';
  senha: string = '';
  isPlus: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;

  constructor(private auth: AuthController, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  register(): void {
    this.loading = true;
    
    // Definir o tipo de usuário baseado no checkbox
    const tipoUsuario = this.isPlus ? 'premium' : 'basic';

    this.auth.register(this.nome, this.email, this.senha, tipoUsuario).subscribe({
      next: () => {
        this.loading = false;
        alert('Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erro:', err);
        alert('Erro ao criar conta. Tente novamente.');
      }
    });
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }
}