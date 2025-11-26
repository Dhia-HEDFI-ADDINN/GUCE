import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="result-container">
      <mat-card class="result-card failure">
        <mat-icon class="result-icon">error</mat-icon>
        <h1>Paiement échoué</h1>
        <p class="error-message">Le paiement n'a pas pu être effectué. Veuillez réessayer.</p>

        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/e-payment/checkout/IMP-2024-001234">
            <mat-icon>refresh</mat-icon> Réessayer
          </button>
          <button mat-stroked-button routerLink="/e-force/declarations/1">
            <mat-icon>arrow_back</mat-icon> Retour
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .result-container { padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 60vh; }
    .result-card { padding: 48px; text-align: center; max-width: 400px;
      &.failure { .result-icon { font-size: 80px; width: 80px; height: 80px; color: #f44336; } }
      h1 { margin: 24px 0 16px; }
      .error-message { color: #757575; margin: 0 0 32px; }
      .actions { display: flex; flex-direction: column; gap: 12px; }
    }
  `]
})
export class PaymentFailureComponent {}
