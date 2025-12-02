import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // ... resto do código igual
  
  nome: string = '';
  email: string = '';
  senha: string = '';
  isPlus: boolean = false;
  isLoading: boolean = false;

  constructor(private auth: AuthController, private router: Router) {}

  mostrarSenha: boolean = false;

  register(): void {
    console.log('Dados no Componente:', this.nome, this.email, this.senha); // Debug

    if (!this.nome || !this.email || !this.senha) {
      alert('Preencha todos os campos antes de enviar!');
      return;
    }

    this.isLoading = true;
    const tipo = this.isPlus ? 'premium' : 'basic';

    this.auth.register(this.nome, this.email, this.senha, tipo).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Conta criada com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(err);
        alert('Erro: ' + (err.error?.message || 'Falha no servidor'));
      }
    });
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }
  
  voltar() { this.router.navigate(['/login']); }
}