import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // 👇 2. MUDANÇA: O Angular decide sozinho se usa localhost ou Render
  private apiUrl = environment.apiUrl + '/chat';

  constructor(private http: HttpClient) { }

  // Adicionei o 'history' aqui, pois o Barry precisa dele para lembrar do contexto
  sendMessage(mensagemDoUsuario: string, history: any[] = []): Observable<any> {
    
    const body = { 
      message: mensagemDoUsuario,
      history: history // Envia o histórico vazio ou cheio
    };
    
    return this.http.post(this.apiUrl, body);
  }
}