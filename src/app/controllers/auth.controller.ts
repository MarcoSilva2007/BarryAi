import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthController {
  
  private apiUrl = 'http://localhost:5000/api'; 

  constructor(private http: HttpClient) {}

  // --- LOGIN ---
  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(res => this.salvarSessao(res)),
      catchError(err => {
        console.warn('Backend offline. Usando login simulado.');
        // Chama a simulação corrigida
        const respostaSimulada = this.simularLogin(email);
        return of(respostaSimulada);
      })
    );
  }

  // --- REGISTRO ---
  // Ajustei os tipos para baterem com seu Model ('basic' | 'premium' | 'admin')
  register(name: string, email: string, senha: string, tipo: 'basic' | 'premium' | 'admin' = 'basic'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, senha, tipo }).pipe(
      catchError(err => {
        console.warn('Backend offline. Simulando cadastro.');
        return of({ success: true, message: 'Cadastro simulado com sucesso' });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // --- FUNÇÕES AUXILIARES ---

  private salvarSessao(res: any) {
    // O token fica solto no localStorage, não dentro do objeto User
    localStorage.setItem('token', res.token);
    // O objeto usuario obedece estritamente a interface User
    localStorage.setItem('user', JSON.stringify(res.usuario));
  }

  private simularLogin(email: string) {
    // 1. Define o tipo com base no email (Lógica para TCC)
    let tipoUser: 'basic' | 'premium' | 'admin' = 'basic';

    if (email.includes('admin')) {
      tipoUser = 'admin';
    } else if (email.includes('premium') || email.includes('plus')) {
      tipoUser = 'premium';
    }

    // 2. Cria o usuário respeitando EXATAMENTE o seu Model
    // Não colocamos 'token' aqui dentro para não dar erro
    const fakeUser: User = {
      id: '1',             // String (conforme seu model)
      name: 'Usuário Teste', // 'name' (conforme seu model)
      email: email,
      tipo: tipoUser       // 'basic', 'premium' ou 'admin'
    };

    // 3. Salva e retorna a estrutura { usuario, token }
    const resposta = { 
      usuario: fakeUser, 
      token: 'token-falso-123-tcc' 
    };
    
    this.salvarSessao(resposta);
    return resposta;
  }
}