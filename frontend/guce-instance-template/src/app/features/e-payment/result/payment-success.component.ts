import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="result-container">
      <mat-card class="result-card success">
        <mat-icon class="result-icon">check_circle</mat-icon>
        <h1>Paiement réussi</h1>
        <p class="amount">7 797 500 XAF</p>
        <p class="reference">Référence: PAY-2024-001234</p>

        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/e-payment/receipts/1">
            <mat-icon>receipt</mat-icon> Voir le reçu
          </button>
          <button mat-stroked-button routerLink="/e-force/declarations/1">
            <mat-icon>arrow_back</mat-icon> Retour à la déclaration
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .result-container { padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 60vh; }
    .result-card { padding: 48px; text-align: center; max-width: 400px;
      &.success { .result-icon { font-size: 80px; width: 80px; height: 80px; color: #4caf50; } }
      h1 { margin: 24px 0 16px; }
      .amount { font-size: 28px; font-weight: 700; color: #1976d2; margin: 0 0 8px; }
      .reference { color: #757575; margin: 0 0 32px; }
      .actions { display: flex; flex-direction: column; gap: 12px; }
    }
  `]
})
export class PaymentSuccessComponent {}
