import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthController {
  
  // Aponta para o servidor Node que acabamos de criar
  private apiUrl = 'http://localhost:5000/api'; 

  constructor(private http: HttpClient) {}

  // --- LOGIN REAL ---
  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(res => {
        // Se o Node responder sucesso, salvamos os dados reais
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.usuario));
      })
    );
  }

  // --- REGISTRO REAL ---
  register(name: string, email: string, senha: string, tipo: 'basic' | 'premium' | 'admin' = 'basic'): Observable<any> {
    // Manda pro Node salvar no MongoDB
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, senha, tipo });
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
}