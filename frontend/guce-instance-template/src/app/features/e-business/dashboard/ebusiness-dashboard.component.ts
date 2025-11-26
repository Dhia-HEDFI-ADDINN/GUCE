import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'guce-ebusiness-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="ebusiness-dashboard">
      <div class="stats-grid">
        <mat-card class="stat-card" routerLink="/e-business/clients">
          <div class="stat-icon clients"><mat-icon>people</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.clients }}</span>
            <span class="stat-label">Clients actifs</span>
          </div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/e-business/declarations">
          <div class="stat-icon declarations"><mat-icon>description</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.declarations }}</span>
            <span class="stat-label">Déclarations en cours</span>
          </div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/e-business/billing">
          <div class="stat-icon pending"><mat-icon>pending</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pendingPayments }}</span>
            <span class="stat-label">Paiements en attente</span>
          </div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/e-business/billing/invoices">
          <div class="stat-icon revenue"><mat-icon>payments</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(stats.monthlyRevenue) }}</span>
            <span class="stat-label">CA ce mois</span>
          </div>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Déclarations récentes</mat-card-title>
            <button mat-button color="primary" routerLink="/e-business/declarations">Voir tout</button>
          </mat-card-header>
          <mat-card-content>
            <div class="item-list">
              <div class="item" *ngFor="let d of recentDeclarations" [routerLink]="['/e-force/declarations', d.id]">
                <div class="item-icon"><mat-icon>{{ d.type === 'import' ? 'file_upload' : 'file_download' }}</mat-icon></div>
                <div class="item-info">
                  <span class="item-ref">{{ d.reference }}</span>
                  <span class="item-client">{{ d.client }}</span>
                </div>
                <span class="item-status" [class]="d.status">{{ d.statusLabel }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="right-col">
          <mat-card class="quick-actions">
            <mat-card-header><mat-card-title>Actions rapides</mat-card-title></mat-card-header>
            <mat-card-content>
              <button mat-stroked-button routerLink="/e-business/clients/new"><mat-icon>person_add</mat-icon> Nouveau client</button>
              <button mat-stroked-button routerLink="/e-business/declarations/new"><mat-icon>add</mat-icon> Nouvelle déclaration</button>
              <button mat-stroked-button routerLink="/e-business/reports"><mat-icon>assessment</mat-icon> Générer rapport</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="clients-card">
            <mat-card-header><mat-card-title>Top clients</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="client-item" *ngFor="let c of topClients">
                <span class="client-name">{{ c.name }}</span>
                <span class="client-count">{{ c.count }} dossiers</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ebusiness-dashboard { padding: 24px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      cursor: pointer;

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }

        &.clients { background: #1976d2; }
        &.declarations { background: #7b1fa2; }
        &.pending { background: #f57c00; }
        &.revenue { background: #388e3c; }
      }

      .stat-info {
        .stat-value { display: block; font-size: 28px; font-weight: 700; }
        .stat-label { font-size: 13px; color: #757575; }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .recent-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .item-list {
        .item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fafafa;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;

          &:hover { background: #f0f0f0; }

          .item-icon {
            width: 40px;
            height: 40px;
            background: #e3f2fd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;

            mat-icon { color: #1976d2; }
          }

          .item-info {
            flex: 1;
            .item-ref { display: block; font-weight: 500; }
            .item-client { font-size: 12px; color: #757575; }
          }

          .item-status {
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;

            &.processing { background: #fff3e0; color: #e65100; }
            &.approved { background: #e8f5e9; color: #2e7d32; }
          }
        }
      }
    }

    .right-col {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .quick-actions mat-card-content {
        display: flex;
        flex-direction: column;
        gap: 8px;

        button { justify-content: flex-start; }
      }

      .clients-card {
        .client-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          .client-name { font-weight: 500; }
          .client-count { color: #757575; font-size: 13px; }
        }
      }
    }
  `]
})
export class EbusinessDashboardComponent {
  stats = { clients: 45, declarations: 23, pendingPayments: 8, monthlyRevenue: 12500000 };

  recentDeclarations = [
    { id: '1', reference: 'IMP-2024-001234', type: 'import', client: 'SARL Tech', status: 'processing', statusLabel: 'En cours' },
    { id: '2', reference: 'EXP-2024-005678', type: 'export', client: 'Agro SA', status: 'approved', statusLabel: 'Approuvée' }
  ];

  topClients = [
    { name: 'SARL Tech Import', count: 12 },
    { name: 'Agro Export SA', count: 8 },
    { name: 'Auto Parts', count: 6 }
  ];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }
}
