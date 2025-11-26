import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-decision-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatSelectModule
  ],
  template: `
    <div class="decisions-container">
      <div class="page-header">
        <h1>Décisions rendues</h1>
        <p>Historique des décisions prises sur les dossiers</p>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <mat-card class="stat-card approved">
          <mat-icon>check_circle</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.approved }}</span>
            <span class="stat-label">Approuvées</span>
          </div>
        </mat-card>
        <mat-card class="stat-card rejected">
          <mat-icon>cancel</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.rejected }}</span>
            <span class="stat-label">Rejetées</span>
          </div>
        </mat-card>
        <mat-card class="stat-card info_requested">
          <mat-icon>help</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.infoRequested }}</span>
            <span class="stat-label">Info demandée</span>
          </div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Référence...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Décision</mat-label>
            <mat-select [(ngModel)]="decisionFilter">
              <mat-option value="">Toutes</mat-option>
              <mat-option value="approved">Approuvées</mat-option>
              <mat-option value="rejected">Rejetées</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <table mat-table [dataSource]="decisions">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let d">{{ d.reference }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let d">{{ d.type }}</td>
          </ng-container>

          <ng-container matColumnDef="operator">
            <th mat-header-cell *matHeaderCellDef>Opérateur</th>
            <td mat-cell *matCellDef="let d">{{ d.operator }}</td>
          </ng-container>

          <ng-container matColumnDef="decision">
            <th mat-header-cell *matHeaderCellDef>Décision</th>
            <td mat-cell *matCellDef="let d">
              <mat-chip [class]="'decision-' + d.decision">
                <mat-icon>{{ d.decision === 'approved' ? 'check' : 'close' }}</mat-icon>
                {{ d.decision === 'approved' ? 'Approuvée' : 'Rejetée' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let d">{{ d.date }}</td>
          </ng-container>

          <ng-container matColumnDef="agent">
            <th mat-header-cell *matHeaderCellDef>Agent</th>
            <td mat-cell *matCellDef="let d">{{ d.agent }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="25" [pageSizeOptions]="[10, 25, 50]"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .decisions-container { padding: 24px; }

    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 24px; }
      p { margin: 4px 0 0; color: #757575; }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      > mat-icon { font-size: 40px; width: 40px; height: 40px; }

      &.approved { mat-icon { color: #4caf50; } }
      &.rejected { mat-icon { color: #f44336; } }
      &.info_requested { mat-icon { color: #ff9800; } }

      .stat-info {
        .stat-value { display: block; font-size: 28px; font-weight: 700; }
        .stat-label { font-size: 13px; color: #757575; }
      }
    }

    .filters-card {
      padding: 16px;
      margin-bottom: 24px;

      .filters-row {
        display: flex;
        gap: 16px;
        .search-field { flex: 1; }
      }
    }

    .table-card {
      overflow: hidden;
      table { width: 100%; }
    }

    ::ng-deep {
      .decision-approved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .decision-rejected { background-color: #ffebee !important; color: #c62828 !important; }
    }
  `]
})
export class DecisionListComponent implements OnInit {
  displayedColumns = ['reference', 'type', 'operator', 'decision', 'date', 'agent'];
  searchQuery = '';
  decisionFilter = '';

  stats = { approved: 156, rejected: 12, infoRequested: 8 };

  decisions = [
    { reference: 'IMP-2024-001232', type: 'Import', operator: 'SARL Tech', decision: 'approved', date: '10/12/2024 14:30', agent: 'P. Martin' },
    { reference: 'EXP-2024-005676', type: 'Export', operator: 'Agro SA', decision: 'approved', date: '10/12/2024 12:15', agent: 'P. Martin' },
    { reference: 'IMP-2024-001231', type: 'Import', operator: 'Auto Parts', decision: 'rejected', date: '10/12/2024 11:00', agent: 'J. Dubois' },
    { reference: 'CERT-2024-005675', type: 'Certificat', operator: 'Cacao Plus', decision: 'approved', date: '10/12/2024 10:30', agent: 'P. Martin' }
  ];

  ngOnInit() {}
}
