import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'guce-epayment-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="history-container">
      <h1>Historique des paiements</h1>

      <mat-card class="table-card">
        <table mat-table [dataSource]="payments">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let p">{{ p.reference }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let p">{{ p.description }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let p">{{ formatCurrency(p.amount) }}</td>
          </ng-container>

          <ng-container matColumnDef="method">
            <th mat-header-cell *matHeaderCellDef>Mode</th>
            <td mat-cell *matCellDef="let p">{{ p.method }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [class]="'status-' + p.status">{{ p.statusLabel }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.date }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [routerLink]="['/e-payment/receipts', p.id]" *ngIf="p.status === 'success'">
                <mat-icon>receipt</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="25"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .history-container { padding: 24px; h1 { margin: 0 0 24px; } }
    .table-card { overflow: hidden; table { width: 100%; } }
    ::ng-deep { .status-success { background: #e8f5e9 !important; color: #2e7d32 !important; } .status-pending { background: #fff3e0 !important; color: #e65100 !important; } .status-failed { background: #ffebee !important; color: #c62828 !important; } }
  `]
})
export class PaymentHistoryComponent {
  displayedColumns = ['reference', 'description', 'amount', 'method', 'status', 'date', 'actions'];

  payments = [
    { id: '1', reference: 'PAY-2024-001234', description: 'Droits et taxes IMP-2024-001233', amount: 7797500, method: 'Mobile Money', status: 'success', statusLabel: 'Réussi', date: '10/12/2024' },
    { id: '2', reference: 'PAY-2024-001233', description: 'Certificat origine', amount: 25000, method: 'Carte', status: 'success', statusLabel: 'Réussi', date: '08/12/2024' }
  ];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }
}
