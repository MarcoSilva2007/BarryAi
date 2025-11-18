import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown'; // <--- 1. MUDANÇA: Importar isso
import { IAController } from '../../controllers/ia.controller';

interface Mensagem {
  texto: string;
  tipo: 'user' | 'ai';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  // 2. MUDANÇA: Adicionar MarkdownModule na lista de imports
  imports: [CommonModule, FormsModule, MarkdownModule], 
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mensagens: Mensagem[] = [];
  // 3. MUDANÇA: Variável para ligar com o input do HTML novo
  textoInput: string = ''; 
  carregando: boolean = false;

  constructor(private ia: IAController) {}

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

  // 4. MUDANÇA: Ajustado para pegar o valor da variável 'textoInput'
  // (Isso casa com o HTML Pro que usa [(ngModel)]="textoInput")
  enviar(): void {
    if (!this.textoInput.trim()) return;

    const msg = this.textoInput; // Pega o texto da variável

    this.mensagens.push({ texto: msg, tipo: 'user' });
    this.textoInput = ''; // Limpa o input automaticamente
    this.carregando = true;

    this.ia.perguntar(msg).subscribe({
      next: (res) => {
        this.mensagens.push({ texto: res.resposta, tipo: 'ai' });
        this.carregando = false;
      },
      error: (err: any) => {
        console.error(err);
        this.mensagens.push({ texto: 'Erro ao conectar com Barry.', tipo: 'ai' });
        this.carregando = false;
      }
    });
  }
}