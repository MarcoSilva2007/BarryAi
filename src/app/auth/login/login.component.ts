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
  // Garanta que o nome do arquivo aqui seja IGUAL ao nome do arquivo na pasta
  styleUrls: ['./login.component.scss'] 
})
export class LoginComponent {
  
  emailInput: string = '';
  senhaInput: string = '';

  constructor(private auth: AuthController, private router: Router) {}

  login(): void {
    // 1. DEBUG: Mostra no console o que o Angular "pegou" dos inputs
    console.log('Tentando logar com:', this.emailInput, this.senhaInput);

    // 2. VALIDAÇÃO: Impede envio se estiver vazio
    if (!this.emailInput || !this.senhaInput) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // 3. CHAMADA AO SERVIÇO
    this.auth.login(this.emailInput, this.senhaInput).subscribe({
      next: (res) => {
        console.log('Login realizado com sucesso:', res);
        
        const user = this.auth.getUser();
        console.log('Dados do usuário salvo:', user);
        
        // Redirecionamento baseado no tipo
        if (user?.tipo === 'admin') {
          this.router.navigate(['/admin']); 
        } else {
          this.router.navigate(['/chat']); 
        }
      },
      error: (err) => {
        // Mostra o erro real no console (ex: 401 Unauthorized ou 404 Not Found)
        console.error('Erro ao fazer login:', err);
        
        if (err.status === 401 || err.status === 403) {
            alert('Email ou senha incorretos.');
        } else {
            alert('Erro no servidor. Tente novamente mais tarde.');
        }
      }
    });
  }

  irParaRegistro(): void {
    this.router.navigate(['/register']);
  }
}