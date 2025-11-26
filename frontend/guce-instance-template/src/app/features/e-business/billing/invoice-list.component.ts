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
  selector: 'guce-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="invoice-list-container">
      <div class="page-header">
        <h1>Factures</h1>
        <button mat-flat-button color="primary"><mat-icon>add</mat-icon> Nouvelle facture</button>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="invoices">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef>N° Facture</th>
            <td mat-cell *matCellDef="let inv">{{ inv.number }}</td>
          </ng-container>

          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let inv">{{ inv.client }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let inv">{{ formatCurrency(inv.amount) }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let inv">
              <mat-chip [class]="'status-' + inv.status">{{ inv.statusLabel }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let inv">{{ inv.date }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let inv">
              <button mat-icon-button><mat-icon>download</mat-icon></button>
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
    .invoice-list-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .table-card { overflow: hidden; table { width: 100%; } }
    ::ng-deep { .status-paid { background: #e8f5e9 !important; color: #2e7d32 !important; } .status-pending { background: #fff3e0 !important; color: #e65100 !important; } }
  `]
})
export class InvoiceListComponent {
  displayedColumns = ['number', 'client', 'amount', 'status', 'date', 'actions'];
  invoices = [
    { number: 'INV-2024-001', client: 'SARL Tech Import', amount: 1500000, status: 'pending', statusLabel: 'En attente', date: '10/12/2024' },
    { number: 'INV-2024-002', client: 'Agro Export SA', amount: 850000, status: 'paid', statusLabel: 'Payée', date: '08/12/2024' }
  ];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }
}
