import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'guce-receipt-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="receipt-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/e-payment/history"><mat-icon>arrow_back</mat-icon></button>
        <h1>Reçu de paiement</h1>
        <button mat-stroked-button (click)="download()"><mat-icon>download</mat-icon> Télécharger</button>
      </div>

      <mat-card class="receipt-card">
        <div class="receipt-header">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h2>Paiement réussi</h2>
          <p class="receipt-ref">{{ receipt.reference }}</p>
        </div>

        <mat-divider></mat-divider>

        <div class="receipt-body">
          <div class="info-row">
            <span class="label">Montant payé</span>
            <span class="value amount">{{ formatCurrency(receipt.amount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date</span>
            <span class="value">{{ receipt.date }}</span>
          </div>
          <div class="info-row">
            <span class="label">Mode de paiement</span>
            <span class="value">{{ receipt.method }}</span>
          </div>
          <div class="info-row">
            <span class="label">Transaction</span>
            <span class="value">{{ receipt.transactionId }}</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="receipt-footer">
          <h4>Détails</h4>
          <div class="detail-item" *ngFor="let item of receipt.details">
            <span>{{ item.label }}</span>
            <span>{{ formatCurrency(item.amount) }}</span>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .receipt-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { flex: 1; margin: 0; } }
    .receipt-card { padding: 32px; text-align: center;
      .receipt-header { .success-icon { font-size: 64px; width: 64px; height: 64px; color: #4caf50; } h2 { margin: 16px 0 8px; } .receipt-ref { color: #757575; margin: 0; } }
      .receipt-body { padding: 24px 0; text-align: left; .info-row { display: flex; justify-content: space-between; padding: 12px 0; .label { color: #757575; } .value { font-weight: 500; &.amount { font-size: 20px; color: #1976d2; } } } }
      .receipt-footer { padding-top: 24px; text-align: left; h4 { margin: 0 0 16px; } .detail-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; } }
    }
  `]
})
export class ReceiptDetailComponent {
  receipt = {
    reference: 'PAY-2024-001234',
    amount: 7797500,
    date: '10/12/2024 14:35',
    method: 'MTN Mobile Money',
    transactionId: 'TXN-2024-987654321',
    details: [
      { label: 'Droits de douane', amount: 3500000 },
      { label: 'TVA', amount: 4043750 },
      { label: 'Précompte', amount: 175000 },
      { label: 'Redevance', amount: 78750 }
    ]
  };

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }

  download() {
    console.log('Download receipt');
  }
}
