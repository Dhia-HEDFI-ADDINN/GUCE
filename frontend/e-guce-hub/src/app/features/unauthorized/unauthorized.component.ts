import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <h1>🚫 Accès Non Autorisé</h1>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <a routerLink="/dashboard">Retour au Dashboard</a>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      font-family: Roboto, Arial, sans-serif;
    }
    h1 { color: #d32f2f; }
    p { color: #666; margin: 20px 0; }
    a {
      color: #1976d2;
      text-decoration: none;
      padding: 10px 20px;
      border: 1px solid #1976d2;
      border-radius: 4px;
    }
    a:hover { background: #e3f2fd; }
  `]
})
export class UnauthorizedComponent {}
