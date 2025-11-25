import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { IAController } from '../../controllers/ia.controller';

interface Mensagem {
  texto: string;
  tipo: 'user' | 'ai';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked, OnInit {
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mensagens: Mensagem[] = [];
  textoInput: string = ''; 
  carregando: boolean = false;

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
            tipo: m.sender === 'user' ? 'user' : 'ai'
          }));
        } else {
           this.mensagens.push({ texto: "**Olá!** Sou o Barry AI. Vamos correr?", tipo: 'ai' });
        }
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if(this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  enviar(): void {
    if (!this.textoInput.trim()) return;

    const msg = this.textoInput;
    const historicoParaEnviar = [...this.mensagens]; // Copia o estado atual

    // 1. Mostra na tela
    this.mensagens.push({ texto: msg, tipo: 'user' });
    this.ia.salvarNoBanco(msg, 'user');
    
    this.textoInput = '';
    this.carregando = true;

    // 2. Envia para o Python
    this.ia.perguntar(msg, historicoParaEnviar).subscribe({
      next: (res: any) => {
        this.mensagens.push({ texto: res.resposta, tipo: 'ai' });
        this.ia.salvarNoBanco(res.resposta, 'ai');
        this.carregando = false;
      },
      error: (err: any) => {
        console.error(err);
        this.mensagens.push({ texto: 'Erro de conexão.', tipo: 'ai' });
        this.carregando = false;
      }
    });
  }
}