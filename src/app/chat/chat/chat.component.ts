import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown'; 
import { ChatService } from '../chat.service';
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MarkdownModule
  ],
  
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  // 1. Declaração das variáveis com os nomes EXATOS do seu HTML
  userMessage: string = ''; 
  mensagens: any[] = [];      // Era 'messages'
  carregando: boolean = false; // Era 'isBarryTyping'

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  enviar() {
    if (!this.userMessage.trim()) return;

    this.mensagens.push({ text: this.userMessage, isUser: true });
    
    const msgEnvio = this.userMessage;
    this.userMessage = ''; 
    this.carregando = true;

     this.chatService.sendMessage(msgEnvio).subscribe({
      next: (resposta) => {
        this.carregando = false;
        console.log('RESPOSTA COMPLETA DO BACKEND:', resposta);

        this.mensagens.push({ 
          text: resposta.response, 
          isUser: false 
        });
      },
      error: (erro) => {
        console.error(erro);
        this.carregando = false;
        this.mensagens.push({ text: "Erro ao conectar.", isUser: false });
      }
    });
  }
}