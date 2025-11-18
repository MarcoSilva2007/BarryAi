import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 🔥 Aqui vai a URL base da API
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    // A requisição será feita para: http://localhost:3000/api/auth/login
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<any> {
    // A requisição será feita para: http://localhost:3000/api/auth/register
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }
}