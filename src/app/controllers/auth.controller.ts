import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthController {
  
  // Se estiver usando Render ou Ngrok, verifique se o link está certo aqui!
  private apiUrl = 'http://localhost:5000/api'; 

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<any> {
    // Mapeia 'senha' para 'password' se o backend esperar password
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password: senha });
  }

  // AQUI ESTAVA O PROBLEMA DO REGISTRO
  register(nome: string, email: string, senha: string, tipo: string = 'basic'): Observable<any> {
    
    // Cria o objeto EXATAMENTE como o Mongoose espera (Schema do server.js)
    const dadosParaEnviar = {
      name: nome,        // O banco quer 'name', você tinha 'nome'
      email: email,      // Igual
      password: senha,   // O banco quer 'password', você tinha 'senha'
      tipo: tipo         // Igual
    };

    console.log('📤 Angular enviando:', dadosParaEnviar); // Debug no navegador

    return this.http.post<any>(`${this.apiUrl}/register`, dadosParaEnviar);
  }

  // ... (o resto do arquivo: logout, getUser, etc. pode manter igual)
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
}