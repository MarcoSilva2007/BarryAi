import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  
  nome: string = '';
  email: string = '';
  senha: string = '';
  isPlus: boolean = false;
  isLoading: boolean = false;
  mostrarSenha: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    // Debug para garantir que é texto simples
    console.log('Senha digitada:', this.senha); 

    if (!this.nome || !this.email || !this.senha) {
      alert('Preencha todos os campos antes de enviar!');
      return;
    }

    this.isLoading = true;

    // 👇 MUDANÇA 3: Chama o service direto
    this.authService.register(this.nome, this.email, this.senha).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Conta criada com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(err);
        // Tenta pegar a mensagem de erro bonita do Python
        const mensagemErro = err.error?.detail || 'Falha no servidor';
        alert('Erro: ' + mensagemErro);
      }
    });
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }
  
  voltar() { this.router.navigate(['/login']); }
}