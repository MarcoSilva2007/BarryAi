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


    // 1. Pegamos todas as mensagens atuais
    // 2. O .filter remove qualquer coisa que seja null, undefined ou vazia
    const historicoLimpo = this.mensagens
      .filter(
        (m) => m.texto && m.texto !== null && String(m.texto).trim() !== ''
      )
      .map((m) => ({
        role: m.tipo === 'user' ? 'user' : 'model',
        // O String() aqui garante que NUNCA vai ser null, no pior caso vira a palavra "null"
        parts: [String(m.texto)],
      }));

    // DEBUG: Olha no console do navegador (F12) o que estamos mandando agora
    console.log('Histórico LIMPO sendo enviado:', historicoLimpo);

    // --- ATUALIZA A TELA ---
    this.mensagens.push({ texto: msg, tipo: 'user' });
    this.textoInput = '';
    this.carregando = true;

    // --- ENVIA ---
    this.ia
      .perguntar(msg, historicoLimpo) // Envia a versão limpa!
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res: any) => {
          const resposta = res.response || res.resposta || 'Sem resposta.';
          this.mensagens.push({ texto: resposta, tipo: 'ai' });
        },
        error: (err: any) => {
          console.error('Erro:', err);
          this.mensagens.push({
            texto: 'Erro ao processar mensagem.',
            tipo: 'ai',
          });
        },
      });
  }
}
