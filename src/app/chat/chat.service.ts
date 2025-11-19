import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // 🔴 ATENÇÃO: Verifique se a rota é /chat mesmo, conforme você testou no Postman
  private apiUrl = 'http://localhost:8000/chat';

  constructor(private http: HttpClient) { }

  sendMessage(mensagemDoUsuario: string): Observable<any> {
    // Aqui estamos mandando um JSON igual você fez no Postman
    // Ajuste a chave "message" se o seu backend esperar outro nome (ex: "prompt", "text")
    const body = { message: mensagemDoUsuario };
    
    return this.http.post(this.apiUrl, body);
  }
}