import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthController } from './auth.controller'; // Importar para pegar o ID do usuário

// ... imports continuam iguais

@Injectable({
  providedIn: 'root'
})
export class IAController {

  private pythonUrl = 'http://localhost:8000';
  private nodeUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthController) {}

  // 1. Agora aceita o ARRAY de mensagens anteriores
  perguntar(perguntaAtual: string, historicoAngular: any[]): Observable<any> {
    
    // 2. Prepara o histórico para o Python
    // Pegamos as últimas 10 mensagens para não ficar muito pesado
    const historicoFormatado = historicoAngular.slice(-10).map(msg => {
      return {
        // O Google usa 'model' para a IA, e nós usamos 'ai'. Temos que converter.
        role: msg.tipo === 'user' ? 'user' : 'model', 
        parts: [msg.texto]
      };
    });

    const payload = { 
      message: perguntaAtual,
      history: historicoFormatado 
    };

    return this.http.post<any>(`${this.pythonUrl}/chat`, payload).pipe(
      map(dados => { return { resposta: dados.response }; })
    );
  }
  // 2. Salva mensagem no MongoDB (Node)
  salvarNoBanco(texto: string, quemEnviou: 'user' | 'ai'): void {
    const user = this.auth.getUser();
    if (!user || !user.id) return; // Se não tiver logado, não salva

    const payload = {
      userId: user.id,
      sender: quemEnviou,
      text: texto
    };

    // Manda pro Node salvar (subscribe vazio pois não precisamos esperar a resposta)
    this.http.post(`${this.nodeUrl}/messages`, payload).subscribe();
  }

  // 3. Carrega histórico do MongoDB
  carregarHistorico(): Observable<any[]> {
    const user = this.auth.getUser();
    if (!user || !user.id) return new Observable(obs => obs.next([]));

    return this.http.get<any[]>(`${this.nodeUrl}/messages/${user.id}`);
  }
}