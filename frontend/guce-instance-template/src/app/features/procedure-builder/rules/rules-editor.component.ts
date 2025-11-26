import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-rules-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="rules-editor">
      <div class="page-header">
        <button mat-icon-button routerLink="/config/dashboard"><mat-icon>arrow_back</mat-icon></button>
        <h1>Rules Editor</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <p>Éditeur de règles métier...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .rules-editor { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
  `]
})
export class RulesEditorComponent {}
