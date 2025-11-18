import { Component } from '@angular/core';
import { IAController } from '../../../controllers/ia.controller';

interface Mensagem {
  texto: string;
  tipo: 'user' | 'ai';
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  mensagens: Mensagem[] = [];

  constructor(private ia: IAController) {}

  enviar(pergunta: string): void {
    if (!pergunta.trim()) return;

    this.mensagens.push({ texto: pergunta, tipo: 'user' });

    this.ia.perguntar(pergunta).subscribe({
      next: (res) => {
        this.mensagens.push({ texto: res.resposta, tipo: 'ai' });
      },
      error: () => {
        this.mensagens.push({ texto: 'Desculpe, ocorreu um erro. Tente novamente.', tipo: 'ai' });
      }
    });
  }
}