import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-logs-viewer',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule
  ],
  template: `
    <div class="logs-viewer">
      <div class="page-header">
        <h1>Visualisation des logs</h1>
        <div class="header-actions">
          <mat-slide-toggle [(ngModel)]="autoRefresh">Auto-refresh</mat-slide-toggle>
          <button mat-stroked-button (click)="clearLogs()">
            <mat-icon>delete_sweep</mat-icon> Effacer
          </button>
          <button mat-stroked-button>
            <mat-icon>download</mat-icon> Télécharger
          </button>
        </div>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Texte dans les logs...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <mat-select [(ngModel)]="filterLevel" multiple>
              <mat-option value="ERROR">ERROR</mat-option>
              <mat-option value="WARN">WARN</mat-option>
              <mat-option value="INFO">INFO</mat-option>
              <mat-option value="DEBUG">DEBUG</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Service</mat-label>
            <mat-select [(ngModel)]="filterService">
              <mat-option value="">Tous</mat-option>
              <mat-option value="api-gateway">API Gateway</mat-option>
              <mat-option value="auth-service">Auth Service</mat-option>
              <mat-option value="declaration-service">Declaration Service</mat-option>
              <mat-option value="payment-service">Payment Service</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="filterPeriod">
              <mat-option value="15m">15 minutes</mat-option>
              <mat-option value="1h">1 heure</mat-option>
              <mat-option value="6h">6 heures</mat-option>
              <mat-option value="24h">24 heures</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="logs-card">
        <div class="logs-container">
          <div class="log-line" *ngFor="let log of filteredLogs" [class]="log.level.toLowerCase()">
            <span class="timestamp">{{ log.timestamp }}</span>
            <span class="level" [class]="log.level.toLowerCase()">{{ log.level }}</span>
            <span class="service">{{ log.service }}</span>
            <span class="message">{{ log.message }}</span>
            <button mat-icon-button class="expand-btn" *ngIf="log.details" (click)="log.expanded = !log.expanded">
              <mat-icon>{{ log.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
            <div class="log-details" *ngIf="log.expanded && log.details">
              <pre>{{ log.details | json }}</pre>
            </div>
          </div>
        </div>

        <div class="logs-footer">
          <span>{{ filteredLogs.length }} entrées affichées</span>
          <button mat-button (click)="loadMore()">Charger plus...</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .logs-viewer { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } .header-actions { display: flex; align-items: center; gap: 16px; } }
    .filters-card { padding: 16px; margin-bottom: 24px; .filters-row { display: flex; gap: 16px; mat-form-field { flex: 1; } } }
    .logs-card { padding: 0; .logs-container { max-height: 600px; overflow-y: auto; font-family: 'Fira Code', 'Consolas', monospace; font-size: 13px; background: #1e1e1e; color: #d4d4d4; } .log-line { display: flex; flex-wrap: wrap; align-items: flex-start; padding: 8px 16px; border-bottom: 1px solid #333; &:hover { background: #2a2a2a; } &.error { background: rgba(244, 67, 54, 0.1); } &.warn { background: rgba(255, 152, 0, 0.1); } .timestamp { color: #888; min-width: 180px; } .level { min-width: 60px; font-weight: 600; padding: 0 8px; border-radius: 3px; text-align: center; &.error { color: #ff6b6b; } &.warn { color: #ffd93d; } &.info { color: #6bcb77; } &.debug { color: #4d96ff; } } .service { color: #888; min-width: 150px; margin: 0 8px; } .message { flex: 1; word-break: break-word; } .expand-btn { margin-left: auto; mat-icon { color: #888; } } .log-details { width: 100%; margin-top: 8px; padding: 12px; background: #252526; border-radius: 4px; pre { margin: 0; color: #d4d4d4; white-space: pre-wrap; font-size: 12px; } } } .logs-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f5f5f5; border-top: 1px solid #e0e0e0; color: #757575; } }
  `]
})
export class LogsViewerComponent {
  searchQuery = '';
  filterLevel: string[] = ['ERROR', 'WARN', 'INFO'];
  filterService = '';
  filterPeriod = '1h';
  autoRefresh = false;

  logs = [
    { timestamp: '2024-01-15 10:35:12.456', level: 'ERROR', service: 'payment-service', message: 'Failed to process payment: Connection timeout to bank API', details: { paymentId: 'PAY-123', error: 'ETIMEDOUT', retries: 3 }, expanded: false },
    { timestamp: '2024-01-15 10:35:10.234', level: 'INFO', service: 'api-gateway', message: 'Request completed: POST /api/declarations/submit', details: null, expanded: false },
    { timestamp: '2024-01-15 10:35:08.891', level: 'WARN', service: 'declaration-service', message: 'Declaration validation warning: Missing optional field incoterms', details: { declarationId: 'DI-2024-00156', field: 'incoterms' }, expanded: false },
    { timestamp: '2024-01-15 10:35:05.123', level: 'DEBUG', service: 'auth-service', message: 'Token refresh successful for user USR-00123', details: null, expanded: false },
    { timestamp: '2024-01-15 10:35:02.567', level: 'INFO', service: 'api-gateway', message: 'New connection from 192.168.1.100', details: null, expanded: false },
    { timestamp: '2024-01-15 10:34:58.012', level: 'ERROR', service: 'declaration-service', message: 'Database query failed: deadlock detected', details: { query: 'UPDATE declarations SET status = ...', error: 'DEADLOCK' }, expanded: false },
    { timestamp: '2024-01-15 10:34:55.789', level: 'INFO', service: 'payment-service', message: 'Payment initiated: PAY-124, amount: 150000 XAF', details: null, expanded: false },
    { timestamp: '2024-01-15 10:34:52.345', level: 'WARN', service: 'auth-service', message: 'Multiple failed login attempts for user admin@guce.gov', details: { attempts: 3, ip: '45.67.89.123' }, expanded: false },
    { timestamp: '2024-01-15 10:34:48.678', level: 'INFO', service: 'api-gateway', message: 'Health check passed for all services', details: null, expanded: false }
  ];

  get filteredLogs(): any[] {
    return this.logs.filter(log => {
      const matchLevel = this.filterLevel.length === 0 || this.filterLevel.includes(log.level);
      const matchService = !this.filterService || log.service === this.filterService;
      const matchSearch = !this.searchQuery ||
        log.message.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchLevel && matchService && matchSearch;
    });
  }

  clearLogs(): void {
    this.logs = [];
  }

  loadMore(): void {
    // Load more logs from server
  }
}
