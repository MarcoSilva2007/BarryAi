import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthController } from 'src/app/controllers/auth.controller';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // AQUI ESTÁ A MUDANÇA: Apontamos para o arquivo HTML
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLogged: boolean = false;
  userName: string = '';

  constructor(private router: Router, private auth: AuthController) {}

  ngOnInit() {
    this.isLogged = this.auth.isLoggedIn();
    if (this.isLogged) {
      const user = this.auth.getUser();
      this.userName = user?.name || 'Velocista';
    }
  }

  navegar(rota: string) {
    this.router.navigate([rota]);
  }

  logout() {
    this.auth.logout();
    this.isLogged = false;
  }
}