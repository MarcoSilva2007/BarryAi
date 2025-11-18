import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <--- Necessário
import { FormsModule } from '@angular/forms';   // <--- Necessário
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-login',
  standalone: true, // <--- OBRIGATÓRIO pois sua rota usa loadComponent
  imports: [CommonModule, FormsModule], // <--- OBRIGATÓRIO para inputs funcionarem
  templateUrl: './login.component.html',
  styles: [`
    .form-container {
      max-width: 400px; margin: 2rem auto; padding: 1.5rem;
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    input { width: 100%; padding: 0.6rem; margin: 0.5rem 0; box-sizing: border-box; }
    button { width: 100%; padding: 0.6rem; background: #3AAED8; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 0.5rem 0; }
    button:hover { opacity: 0.9; }
  `]
})
export class LoginComponent {
  
  // Variáveis para ligar com o HTML (ngModel)
  emailInput: string = '';
  senhaInput: string = '';

  constructor(private auth: AuthController, private router: Router) {}

  login(): void {
    // Usa as variáveis ligadas ao input
    this.auth.login(this.emailInput, this.senhaInput).subscribe({
      next: () => {
        const user = this.auth.getUser();
        
        // AJUSTE DE ROTAS:
        // Redireciona para as rotas que REALMENTE existem no seu app-routing.module.ts
        if (user?.tipo === 'admin') {
          this.router.navigate(['/admin']); 
        } else {
          // Seja premium ou cliente, manda pro chat (pois só criamos a rota /chat)
          this.router.navigate(['/chat']); 
        }
      },
      error: () => alert('Login falhou. Verifique suas credenciais.')
    });
  }
  irParaRegistro(): void {
    this.router.navigate(['/register']);
  }
}