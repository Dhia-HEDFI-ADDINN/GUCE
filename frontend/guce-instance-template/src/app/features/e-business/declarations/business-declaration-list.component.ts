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
  selector: 'guce-business-declaration-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="declarations-container">
      <div class="page-header">
        <h1>Déclarations clients</h1>
        <button mat-flat-button color="primary" routerLink="/e-business/declarations/new">
          <mat-icon>add</mat-icon> Nouvelle déclaration
        </button>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="declarations">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let d"><a [routerLink]="['/e-force/declarations', d.id]">{{ d.reference }}</a></td>
          </ng-container>

          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let d">{{ d.client }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let d">{{ d.type }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let d">
              <mat-chip [class]="'status-' + d.status">{{ d.statusLabel }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let d">{{ d.date }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="25"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .declarations-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .table-card { overflow: hidden; table { width: 100%; } a { color: #1976d2; text-decoration: none; } }
    ::ng-deep { .status-draft { background: #f5f5f5 !important; } .status-processing { background: #fff3e0 !important; color: #e65100 !important; } .status-approved { background: #e8f5e9 !important; color: #2e7d32 !important; } }
  `]
})
export class BusinessDeclarationListComponent {
  displayedColumns = ['reference', 'client', 'type', 'status', 'date'];
  declarations = [
    { id: '1', reference: 'IMP-2024-001234', client: 'SARL Tech', type: 'Import', status: 'processing', statusLabel: 'En cours', date: '10/12/2024' },
    { id: '2', reference: 'EXP-2024-005678', client: 'Agro SA', type: 'Export', status: 'approved', statusLabel: 'Approuvée', date: '09/12/2024' }
  ];
}
