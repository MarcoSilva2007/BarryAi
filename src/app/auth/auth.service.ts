import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // A URL vem do environment (não use localhost:3000 fixo)
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    // Envia para https://barryai.../login
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Ajustei para enviar apenas o que o Python espera (email e password)
  // Se o seu Python não tem campo 'name', não adianta enviar daqui por enquanto.
  register(name: string, email: string, password: string): Observable<any> {
    // Envia para https://barryai.../register
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }
}