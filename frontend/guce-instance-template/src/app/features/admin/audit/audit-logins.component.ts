import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-audit-logins',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatChipsModule
  ],
  template: `
    <div class="audit-logins">
      <div class="page-header">
        <h1>Journal des connexions</h1>
        <button mat-stroked-button>
          <mat-icon>download</mat-icon> Exporter
        </button>
      </div>

      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-icon class="success">login</mat-icon>
          <div class="stat-value">{{ stats.successToday }}</div>
          <div class="stat-label">Connexions réussies (24h)</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="error">error</mat-icon>
          <div class="stat-value">{{ stats.failedToday }}</div>
          <div class="stat-label">Échecs (24h)</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="warning">warning</mat-icon>
          <div class="stat-value">{{ stats.suspiciousToday }}</div>
          <div class="stat-label">Suspects (24h)</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>people</mat-icon>
          <div class="stat-value">{{ stats.uniqueUsers }}</div>
          <div class="stat-label">Utilisateurs uniques (24h)</div>
        </mat-card>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Utilisateur, IP...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="filterStatus">
              <mat-option value="">Tous</mat-option>
              <mat-option value="success">Réussie</mat-option>
              <mat-option value="failed">Échouée</mat-option>
              <mat-option value="suspicious">Suspecte</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="filterPeriod">
              <mat-option value="today">Aujourd'hui</mat-option>
              <mat-option value="week">7 derniers jours</mat-option>
              <mat-option value="month">30 derniers jours</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="loginLogs">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Date/Heure</th>
            <td mat-cell *matCellDef="let log">{{ log.timestamp }}</td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let log">
              <div class="user-info">
                <span class="name">{{ log.userName || log.attemptedUser }}</span>
                <span class="email">{{ log.userEmail }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let log">
              <mat-chip [class]="log.status">
                <mat-icon>{{ getStatusIcon(log.status) }}</mat-icon>
                {{ getStatusLabel(log.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="method">
            <th mat-header-cell *matHeaderCellDef>Méthode</th>
            <td mat-cell *matCellDef="let log">{{ log.method }}</td>
          </ng-container>

          <ng-container matColumnDef="device">
            <th mat-header-cell *matHeaderCellDef>Appareil</th>
            <td mat-cell *matCellDef="let log">
              <div class="device-info">
                <mat-icon>{{ log.deviceType === 'mobile' ? 'smartphone' : 'computer' }}</mat-icon>
                <span>{{ log.browser }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Localisation</th>
            <td mat-cell *matCellDef="let log">
              <div class="location-info">
                <span>{{ log.location }}</span>
                <span class="ip">{{ log.ipAddress }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Raison</th>
            <td mat-cell *matCellDef="let log">{{ log.failureReason || '-' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.failed]="row.status === 'failed'" [class.suspicious]="row.status === 'suspicious'"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[50, 100, 200]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-logins { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; &.success { color: #4caf50; } &.error { color: #f44336; } &.warning { color: #ff9800; } } .stat-value { font-size: 28px; font-weight: 600; } .stat-label { color: #757575; font-size: 13px; } }
    .filters-card { padding: 16px; margin-bottom: 24px; .filters-row { display: flex; gap: 16px; mat-form-field { width: 200px; } } }
    .table-card { overflow: hidden; table { width: 100%; } tr.failed { background: #fff8f8; } tr.suspicious { background: #fffaf0; } }
    .user-info, .location-info { display: flex; flex-direction: column; .name { font-weight: 500; } .email, .ip { font-size: 12px; color: #757575; } }
    .device-info { display: flex; align-items: center; gap: 8px; mat-icon { font-size: 18px; width: 18px; height: 18px; color: #757575; } }
    mat-chip { &.success { background: #e8f5e9; color: #2e7d32; } &.failed { background: #ffebee; color: #c62828; } &.suspicious { background: #fff3e0; color: #ef6c00; } mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; } }
  `]
})
export class AuditLoginsComponent {
  searchQuery = '';
  filterStatus = '';
  filterPeriod = 'today';

  displayedColumns = ['timestamp', 'user', 'status', 'method', 'device', 'location', 'reason'];

  stats = {
    successToday: 234,
    failedToday: 12,
    suspiciousToday: 3,
    uniqueUsers: 89
  };

  loginLogs = [
    { timestamp: '2024-01-15 10:30:00', userName: 'Jean Dupont', userEmail: 'jean@example.com', status: 'success', method: 'Mot de passe', deviceType: 'desktop', browser: 'Chrome 120', location: 'Douala, CM', ipAddress: '192.168.1.100', failureReason: null },
    { timestamp: '2024-01-15 10:28:45', attemptedUser: 'admin', userEmail: 'admin@guce.gov', status: 'failed', method: 'Mot de passe', deviceType: 'desktop', browser: 'Firefox 121', location: 'Unknown', ipAddress: '45.67.89.123', failureReason: 'Mot de passe incorrect' },
    { timestamp: '2024-01-15 10:25:12', userName: 'Marie Claire', userEmail: 'marie@admin.gov', status: 'success', method: '2FA', deviceType: 'mobile', browser: 'Safari iOS', location: 'Yaoundé, CM', ipAddress: '10.0.0.50', failureReason: null },
    { timestamp: '2024-01-15 10:20:33', attemptedUser: 'root', userEmail: '', status: 'suspicious', method: 'Mot de passe', deviceType: 'desktop', browser: 'Unknown', location: 'Russia', ipAddress: '185.123.45.67', failureReason: 'Utilisateur inexistant - tentatives multiples' },
    { timestamp: '2024-01-15 10:15:00', userName: 'Pierre Martin', userEmail: 'pierre@transit.com', status: 'success', method: 'SSO', deviceType: 'desktop', browser: 'Edge 120', location: 'Douala, CM', ipAddress: '192.168.2.50', failureReason: null }
  ];

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = { success: 'check_circle', failed: 'cancel', suspicious: 'warning' };
    return icons[status] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { success: 'Réussie', failed: 'Échouée', suspicious: 'Suspecte' };
    return labels[status] || status;
  }
}
