import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  respostaDemo = '';

  enviarDemo(pergunta: string): void {
    if (!pergunta?.trim()) {
      alert('Por favor, digite uma pergunta.');
      return;
    }

    // Simulação de resposta da IA — substitua depois pela API real
    this.respostaDemo = `Olá! Sua pergunta foi: "${pergunta}". Esta é uma resposta de demonstração da BarryAI. 😊`;
  }
}