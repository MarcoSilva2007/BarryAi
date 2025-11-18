import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IAController {

  // 1. AJUSTE: O Python FastAPI roda na porta 8000, não na 5000
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Função principal do Chat
  perguntar(pergunta: string, modelo: string = 'gemini-flash'): Observable<any> {
    
    // 2. AJUSTE: O Python espera receber { "message": "..." }
    const payload = { message: pergunta };

    // 3. AJUSTE: O endpoint no Python é apenas '/chat'
    return this.http.post<any>(this.apiUrl + '/chat', payload).pipe(
      // 4. AJUSTE: O Python devolve "response", mas seu componente espera "resposta".
      // Fazemos a conversão aqui para nada quebrar na tela.
      map(dadosDoPython => {
        return { resposta: dadosDoPython.response };
      })
    );
  }

  // Mantive essa função caso você queira implementar upload de arquivos no futuro
  // (Obs: O backend Python atual ainda não suporta upload, teria que criar a rota lá)
  enviarArquivo(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl + '/upload', formData);
  }
}