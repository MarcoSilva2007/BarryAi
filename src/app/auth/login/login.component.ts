import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  // Dados do Formulário
  emailInput: string = '';
  senhaInput: string = '';

  // --- VARIÁVEIS QUE FALTAVAM ---
  mostrarSenha: boolean = false; // Controla o tipo 'text' ou 'password'
  isLoading: boolean = false;    // Controla o spinner no botão

  constructor(private auth: AuthController, private router: Router) {}

  // 1. Função que alterna o olho da senha
  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  // 2. Login com efeito de carregamento
  login(): void {
    if (!this.emailInput || !this.senhaInput) return;

    // Ativa o loading (trava o botão e mostra spinner)
    this.isLoading = true;

    this.auth.login(this.emailInput, this.senhaInput).subscribe({
      next: () => {
        // Sucesso: Para o loading e redireciona
        this.isLoading = false; 
        const user = this.auth.getUser();

        if (user?.tipo === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/chat']);
        }
      },
      error: (err) => {
        // Erro: Para o loading e avisa
        this.isLoading = false;
        console.error(err);
        alert('Login ou senha incorretos.');
      }
    });
  }

  irParaRegistro(): void {
    this.router.navigate(['/register']);
  }
}