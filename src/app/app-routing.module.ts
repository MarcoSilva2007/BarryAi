import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat/chat.component'; 
import { HomeComponent } from './home/home.component';


const routes: Routes = [

  { path: '', redirectTo: '/chat', pathMatch: 'full' },

  { path: 'chat', component: ChatComponent },

  { path: 'home', component: HomeComponent },

  { path: '**', redirectTo: '/chat' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}