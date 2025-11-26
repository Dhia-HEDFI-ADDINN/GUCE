import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-audit-actions',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule
  ],
  template: `
    <div class="audit-actions">
      <div class="page-header">
        <h1>Journal des actions</h1>
        <button mat-stroked-button>
          <mat-icon>download</mat-icon> Exporter
        </button>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Utilisateur, action, ressource...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type d'action</mat-label>
            <mat-select [(ngModel)]="filterAction">
              <mat-option value="">Tous</mat-option>
              <mat-option value="create">Création</mat-option>
              <mat-option value="update">Modification</mat-option>
              <mat-option value="delete">Suppression</mat-option>
              <mat-option value="approve">Approbation</mat-option>
              <mat-option value="reject">Rejet</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Module</mat-label>
            <mat-select [(ngModel)]="filterModule">
              <mat-option value="">Tous</mat-option>
              <mat-option value="declarations">Déclarations</mat-option>
              <mat-option value="users">Utilisateurs</mat-option>
              <mat-option value="organizations">Organisations</mat-option>
              <mat-option value="payments">Paiements</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de début</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de fin</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="auditLogs">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Date/Heure</th>
            <td mat-cell *matCellDef="let log">{{ log.timestamp }}</td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let log">
              <div class="user-info">
                <span class="name">{{ log.userName }}</span>
                <span class="email">{{ log.userEmail }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let log">
              <mat-chip [class]="log.actionType">{{ log.action }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="resource">
            <th mat-header-cell *matHeaderCellDef>Ressource</th>
            <td mat-cell *matCellDef="let log">
              <div class="resource-info">
                <span class="type">{{ log.resourceType }}</span>
                <span class="id">{{ log.resourceId }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Détails</th>
            <td mat-cell *matCellDef="let log">{{ log.details }}</td>
          </ng-container>

          <ng-container matColumnDef="ip">
            <th mat-header-cell *matHeaderCellDef>IP</th>
            <td mat-cell *matCellDef="let log">{{ log.ipAddress }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[50, 100, 200]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-actions { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .filters-card { padding: 16px; margin-bottom: 24px; .filters-row { display: flex; flex-wrap: wrap; gap: 16px; mat-form-field { width: 200px; } } }
    .table-card { overflow: hidden; table { width: 100%; } }
    .user-info, .resource-info { display: flex; flex-direction: column; .name, .type { font-weight: 500; } .email, .id { font-size: 12px; color: #757575; } }
    mat-chip { &.create { background: #e8f5e9; color: #2e7d32; } &.update { background: #e3f2fd; color: #1976d2; } &.delete { background: #ffebee; color: #c62828; } &.approve { background: #e8f5e9; color: #2e7d32; } &.reject { background: #fff3e0; color: #ef6c00; } }
  `]
})
export class AuditActionsComponent {
  searchQuery = '';
  filterAction = '';
  filterModule = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  displayedColumns = ['timestamp', 'user', 'action', 'resource', 'details', 'ip'];

  auditLogs = [
    { timestamp: '2024-01-15 10:30:45', userName: 'Jean Dupont', userEmail: 'jean@example.com', action: 'Création', actionType: 'create', resourceType: 'Déclaration', resourceId: 'DI-2024-00156', details: 'Nouvelle déclaration import', ipAddress: '192.168.1.100' },
    { timestamp: '2024-01-15 10:25:12', userName: 'Marie Claire', userEmail: 'marie@admin.gov', action: 'Approbation', actionType: 'approve', resourceType: 'Déclaration', resourceId: 'DI-2024-00142', details: 'Validation définitive', ipAddress: '10.0.0.50' },
    { timestamp: '2024-01-15 10:15:33', userName: 'Admin System', userEmail: 'admin@guce.gov', action: 'Modification', actionType: 'update', resourceType: 'Utilisateur', resourceId: 'USR-00234', details: 'Changement de rôle', ipAddress: '10.0.0.1' },
    { timestamp: '2024-01-15 09:45:21', userName: 'Pierre Martin', userEmail: 'pierre@transit.com', action: 'Suppression', actionType: 'delete', resourceType: 'Document', resourceId: 'DOC-45678', details: 'Document obsolète supprimé', ipAddress: '192.168.2.50' },
    { timestamp: '2024-01-15 09:30:00', userName: 'Marie Claire', userEmail: 'marie@admin.gov', action: 'Rejet', actionType: 'reject', resourceType: 'Déclaration', resourceId: 'DI-2024-00139', details: 'Documents non conformes', ipAddress: '10.0.0.50' }
  ];
}
