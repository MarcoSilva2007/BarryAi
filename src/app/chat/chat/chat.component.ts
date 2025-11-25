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

  // 1. Carrega o histórico ao abrir a tela
  ngOnInit() {
    this.carregando = true;
    this.ia.carregarHistorico().subscribe({
      next: (msgsDoBanco) => {
        // Converte do formato do banco para o formato da tela
        this.mensagens = msgsDoBanco.map(m => ({
          texto: m.text,
          tipo: m.sender === 'user' ? 'user' : 'ai'
        }));
        this.carregando = false;
        // Se estiver vazio, adiciona boas vindas
        if (this.mensagens.length === 0) {
            this.mensagens.push({ texto: "**Olá!** Sou o Barry AI. Vamos correr?", tipo: 'ai' });
        }
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
    
    // 1. Guarda o estado ATUAL do histórico (antes de adicionar a nova msg do user)
    // Isso é importante para não enviar a própria pergunta duplicada no histórico
    const historicoParaEnviar = [...this.mensagens]; 

    // Adiciona na tela e no banco
    this.mensagens.push({ texto: msg, tipo: 'user' });
    this.ia.salvarNoBanco(msg, 'user');
    
    this.textoInput = '';
    this.carregando = true;

    // 2. Passa o histórico junto na chamada
    this.ia.perguntar(msg, historicoParaEnviar).subscribe({
      next: (res) => {
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