import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; 
import { MarkdownModule } from 'ngx-markdown'; 
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// ... outros imports

@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    MarkdownModule.forRoot(), 
    RouterModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }