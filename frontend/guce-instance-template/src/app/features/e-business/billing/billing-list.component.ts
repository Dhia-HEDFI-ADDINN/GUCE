import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'guce-billing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="billing-container">
      <div class="page-header">
        <h1>Facturation</h1>
        <button mat-flat-button color="primary" routerLink="/e-business/billing/invoices">
          <mat-icon>receipt</mat-icon> Voir les factures
        </button>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon class="pending">hourglass_empty</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(2500000) }}</span>
            <span class="stat-label">En attente de paiement</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="paid">check_circle</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(8500000) }}</span>
            <span class="stat-label">Encaissé ce mois</span>
          </div>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-header><mat-card-title>Paiements en attente</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="pending-list">
            <div class="pending-item" *ngFor="let p of pendingPayments">
              <div class="item-info">
                <span class="client">{{ p.client }}</span>
                <span class="ref">{{ p.reference }}</span>
              </div>
              <span class="amount">{{ formatCurrency(p.amount) }}</span>
              <button mat-stroked-button>Relancer</button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .billing-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 24px; mat-icon { font-size: 40px; width: 40px; height: 40px; &.pending { color: #f57c00; } &.paid { color: #4caf50; } } .stat-info { .stat-value { display: block; font-size: 24px; font-weight: 700; } .stat-label { color: #757575; } } }
    .pending-list { .pending-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; .item-info { flex: 1; .client { display: block; font-weight: 500; } .ref { font-size: 12px; color: #757575; } } .amount { font-weight: 600; font-size: 16px; } } }
  `]
})
export class BillingListComponent {
  pendingPayments = [
    { client: 'SARL Tech Import', reference: 'INV-2024-001', amount: 1500000 },
    { client: 'Agro Export SA', reference: 'INV-2024-002', amount: 1000000 }
  ];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }
}
