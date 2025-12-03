import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { IAController } from '../../controllers/ia.controller';
import { finalize } from 'rxjs/operators';

interface Mensagem {
  texto: string;
  tipo: 'user' | 'ai';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mensagens: Mensagem[] = [];
  textoInput: string = '';
  carregando: boolean = false;

  isDashboardCollapsed = false;

  toggleDashboard() {
    this.isDashboardCollapsed = !this.isDashboardCollapsed;
  }

  constructor(private ia: IAController) {}

  ngOnInit() {
    this.carregando = true;
    this.ia.carregarHistorico().subscribe({
      // ADICIONADO ': any' PARA PARAR O ERRO
      next: (msgsDoBanco: any) => {
        if (msgsDoBanco && msgsDoBanco.length > 0) {
          // ADICIONADO ': any' PARA PARAR O ERRO
          this.mensagens = msgsDoBanco.map((m: any) => ({
            texto: m.text,
            tipo: m.sender === 'user' ? 'user' : 'ai',
          }));
        } else {
          this.mensagens.push({
            texto: '**Olá!** Sou o Barry AI. Vamos correr?',
            tipo: 'ai',
          });
        }
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop =
          this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  enviar(): void {
    if (!this.textoInput.trim()) return;

    const msg = this.textoInput;

    // ... dentro do enviar()

    // 1. FILTRAGEM (A Mágica acontece aqui)
    // Removemos qualquer mensagem que esteja vazia ou null para não quebrar o Python
    const historicoLimpo = this.mensagens.filter(
      (m) => m.texto && m.texto.trim() !== ''
    );

    // 2. FORMATAÇÃO
    const historicoFormatado = historicoLimpo.map((m) => ({
      role: m.tipo === 'user' ? 'user' : 'model',
      parts: [m.texto], // Agora garantimos que m.texto nunca é null
    }));

    this.mensagens.push({ texto: msg, tipo: 'user' });
    this.textoInput = '';
    this.carregando = true;

    // 3. ENVIA O HISTÓRICO LIMPO
    this.ia
      .perguntar(msg, historicoFormatado)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res: any) => {
          // Aceita 'response' (do Python novo) ou 'resposta' (caso antigo)
          const textoResposta =
            res.response || res.resposta || 'Sem resposta da IA.';

          this.mensagens.push({ texto: textoResposta, tipo: 'ai' });
        },
        error: (err: any) => {
          console.error('Erro detalhado:', err);

          // Mensagem amigável para você saber o que houve
          let msgErro = 'Erro desconhecido.';

          if (err.status === 0)
            msgErro = 'Sem conexão. Verifique HTTPS ou AdBlock.';
          else if (err.status === 404)
            msgErro = 'Endereço da API errado (404).';
          else if (err.status === 500)
            msgErro = 'Erro no servidor Python (500).';
          else if (err.status === 400) msgErro = 'Dados inválidos enviados.';

          this.mensagens.push({ texto: `[ERRO] ${msgErro}`, tipo: 'ai' });
        },
      });
  }
}
