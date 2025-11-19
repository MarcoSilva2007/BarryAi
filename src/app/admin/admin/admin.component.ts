import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthController } from 'src/app/controllers/auth.controller';
import { AdminService } from '../admin.service'; // Importe o serviço novo

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  usuarios: any[] = [];
  
  // Estatísticas Reais
  stats = {
    total: 0,
    premium: 0,
    basic: 0,
    admin: 0
  };

  carregando: boolean = true;

  constructor(
    private auth: AuthController, 
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verifica se é admin mesmo (Segurança básica)
    const user = this.auth.getUser();
    if (user?.tipo !== 'admin') {
      alert('Acesso Negado! Apenas para o Flash Reverso ou Admin.');
      this.router.navigate(['/login']);
      return;
    }

    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.calcularEstatisticas();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar usuários:', err);
        this.carregando = false;
      }
    });
  }

  calcularEstatisticas() {
    this.stats.total = this.usuarios.length;
    // Filtra e conta usando o filter do JavaScript
    this.stats.premium = this.usuarios.filter(u => u.tipo === 'premium' || u.tipo === 'cliente-plus').length;
    this.stats.admin = this.usuarios.filter(u => u.tipo === 'admin').length;
    this.stats.basic = this.usuarios.filter(u => u.tipo === 'basic' || u.tipo === 'cliente').length;
  }

  deletarUsuario(id: string) {
    if(confirm('Tem certeza que quer apagar este usuário do banco?')) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.carregarDados(); // Recarrega a lista
      });
    }
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}