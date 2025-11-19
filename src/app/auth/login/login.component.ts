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
  styleUrls: ['./login.component.scss']
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