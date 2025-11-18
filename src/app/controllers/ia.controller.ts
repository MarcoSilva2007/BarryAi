import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IAController {
  private apiUrl = 'http://localhost:5000/api';

  perguntar(pergunta: string, modelo: string = 'gpt-4'): Observable<any> {
    return this.http.post(this.apiUrl + '/chat', { pergunta, modelo });
  }

  enviarArquivo(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl + '/upload', formData);
  }

  constructor(private http: HttpClient) {}
}