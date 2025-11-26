import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthController } from './auth.controller'; // Importar para pegar o ID do usuário

@Injectable({ providedIn: 'root' })
export class IAController {

  private pythonUrl = 'https://kind-moose-take.loca.lt'; 
  private nodeUrl = 'https://fruity-deer-reply.loca.lt/api'; 

  constructor(private http: HttpClient, private auth: AuthController) {}

  // 1. ATUALIZADO: Agora aceita histórico
  perguntar(perguntaAtual: string, historicoAngular: any[] = []): Observable<any> {
    
    // Converte o histórico do Angular para o Python
    const historicoFormatado = historicoAngular.slice(-10).map(msg => {
      return {
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

  // 2. NOVA FUNÇÃO: Salvar no Banco
  salvarNoBanco(texto: string, quemEnviou: 'user' | 'ai'): void {
    const user = this.auth.getUser();
    // Se não tiver ID (usuário fake ou deslogado), não salva para não dar erro
    if (!user || !user.id) return; 

    const payload = {
      userId: user.id,
      sender: quemEnviou,
      text: texto
    };

    this.http.post(`${this.nodeUrl}/messages`, payload).subscribe({
      error: (err) => console.error('Erro silencioso ao salvar msg:', err)
    });
  }

  // 3. NOVA FUNÇÃO: Carregar Histórico
  carregarHistorico(): Observable<any[]> {
    const user = this.auth.getUser();
    if (!user || !user.id) {
        // Retorna lista vazia se não tiver usuário logado
        return new Observable(obs => { obs.next([]); obs.complete(); });
    }

    return this.http.get<any[]>(`${this.nodeUrl}/messages/${user.id}`);
  }
}