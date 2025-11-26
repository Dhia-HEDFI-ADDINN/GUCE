import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'guce-payment-history',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatMenuModule
  ],
  template: `
    <div class="payment-history-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Historique des paiements</h1>
          <p>Consultez l'historique de tous vos paiements</p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <div class="summary-icon pending">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ formatCurrency(summary.pending) }}</span>
            <span class="summary-label">En attente</span>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="summary-icon paid">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ formatCurrency(summary.paidMonth) }}</span>
            <span class="summary-label">Payé ce mois</span>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="summary-icon total">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-value">{{ formatCurrency(summary.totalYear) }}</span>
            <span class="summary-label">Total annuel</span>
          </div>
        </mat-card>
      </div>

      <!-- Payments Table -->
      <mat-card class="table-card">
        <table mat-table [dataSource]="payments">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let p">{{ p.reference }}</td>
          </ng-container>

          <ng-container matColumnDef="declaration">
            <th mat-header-cell *matHeaderCellDef>Déclaration</th>
            <td mat-cell *matCellDef="let p">
              <a [routerLink]="['/e-force/declarations', p.declarationId]">{{ p.declarationRef }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let p">{{ p.description }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let p">{{ formatCurrency(p.amount) }}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.date }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [class]="'status-' + p.status">{{ getStatusLabel(p.status) }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [matMenuTriggerFor]="payMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #payMenu="matMenu">
                <button mat-menu-item *ngIf="p.status === 'pending'" [routerLink]="['/e-payment/checkout', p.reference]">
                  <mat-icon>payment</mat-icon>
                  <span>Payer</span>
                </button>
                <button mat-menu-item *ngIf="p.status === 'paid'" [routerLink]="['/e-payment/receipts', p.id]">
                  <mat-icon>receipt</mat-icon>
                  <span>Voir reçu</span>
                </button>
                <button mat-menu-item (click)="downloadReceipt(p)" *ngIf="p.status === 'paid'">
                  <mat-icon>download</mat-icon>
                  <span>Télécharger</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="10" [pageSizeOptions]="[10, 25, 50]"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-history-container {
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 24px; }
      p { margin: 4px 0 0; color: #757575; }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      .summary-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: white;
        }

        &.pending { background: #ff9800; }
        &.paid { background: #4caf50; }
        &.total { background: #1976d2; }
      }

      .summary-info {
        display: flex;
        flex-direction: column;

        .summary-value {
          font-size: 24px;
          font-weight: 700;
        }

        .summary-label {
          font-size: 13px;
          color: #757575;
        }
      }
    }

    .table-card {
      overflow: hidden;

      table {
        width: 100%;
      }

      a {
        color: #1976d2;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    ::ng-deep {
      .status-pending { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-paid { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .status-failed { background-color: #ffebee !important; color: #c62828 !important; }
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  displayedColumns = ['reference', 'declaration', 'description', 'amount', 'date', 'status', 'actions'];

  summary = {
    pending: 4677750,
    paidMonth: 12500000,
    totalYear: 85000000
  };

  payments = [
    { id: '1', reference: 'PAY-2024-001234', declarationId: '1', declarationRef: 'IMP-2024-001234', description: 'Droits et taxes', amount: 4677750, date: '10/12/2024', status: 'pending' },
    { id: '2', reference: 'PAY-2024-001233', declarationId: '2', declarationRef: 'IMP-2024-001233', description: 'Droits et taxes', amount: 2850000, date: '09/12/2024', status: 'paid' },
    { id: '3', reference: 'PAY-2024-001232', declarationId: '3', declarationRef: 'EXP-2024-005678', description: 'Frais certificat origine', amount: 25000, date: '08/12/2024', status: 'paid' }
  ];

  ngOnInit() {}

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échoué'
    };
    return labels[status] || status;
  }

  downloadReceipt(payment: any) {
    console.log('Download receipt', payment);
  }
}
