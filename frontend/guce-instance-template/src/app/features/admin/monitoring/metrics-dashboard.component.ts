import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="metrics-dashboard">
      <div class="page-header">
        <h1>Métriques système</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="period">
              <mat-option value="1h">Dernière heure</mat-option>
              <mat-option value="24h">24 heures</mat-option>
              <mat-option value="7d">7 jours</mat-option>
              <mat-option value="30d">30 jours</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-stroked-button>
            <mat-icon>refresh</mat-icon> Actualiser
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.requestsPerSecond }}</div>
          <div class="kpi-label">Requêtes/sec</div>
          <div class="kpi-trend up">
            <mat-icon>trending_up</mat-icon> +12%
          </div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.avgResponseTime }}ms</div>
          <div class="kpi-label">Temps réponse moyen</div>
          <div class="kpi-trend down">
            <mat-icon>trending_down</mat-icon> -5%
          </div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.errorRate }}%</div>
          <div class="kpi-label">Taux d'erreur</div>
          <div class="kpi-trend down">
            <mat-icon>trending_down</mat-icon> -0.2%
          </div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.activeUsers }}</div>
          <div class="kpi-label">Utilisateurs actifs</div>
          <div class="kpi-trend up">
            <mat-icon>trending_up</mat-icon> +8%
          </div>
        </mat-card>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <h3>Requêtes par minute</h3>
          <div class="chart-placeholder">
            <div class="bar-chart">
              <div class="bar" *ngFor="let value of requestsData" [style.height.%]="value"></div>
            </div>
            <div class="chart-labels">
              <span>-60min</span>
              <span>-45min</span>
              <span>-30min</span>
              <span>-15min</span>
              <span>Maintenant</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card">
          <h3>Temps de réponse (ms)</h3>
          <div class="chart-placeholder">
            <div class="line-chart">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                <polyline [attr.points]="getLinePoints()" fill="none" stroke="#1976d2" stroke-width="2"/>
              </svg>
            </div>
            <div class="chart-labels">
              <span>-60min</span>
              <span>-45min</span>
              <span>-30min</span>
              <span>-15min</span>
              <span>Maintenant</span>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="details-grid">
        <mat-card class="details-card">
          <h3>Top endpoints</h3>
          <div class="endpoint-list">
            <div class="endpoint-item" *ngFor="let endpoint of topEndpoints">
              <div class="endpoint-info">
                <span class="method" [class]="endpoint.method.toLowerCase()">{{ endpoint.method }}</span>
                <span class="path">{{ endpoint.path }}</span>
              </div>
              <div class="endpoint-stats">
                <span class="calls">{{ endpoint.calls }} appels</span>
                <span class="avg-time">{{ endpoint.avgTime }}ms</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="details-card">
          <h3>Erreurs récentes</h3>
          <div class="error-list">
            <div class="error-item" *ngFor="let error of recentErrors">
              <div class="error-info">
                <span class="status">{{ error.status }}</span>
                <span class="message">{{ error.message }}</span>
              </div>
              <div class="error-meta">
                <span class="count">{{ error.count }}x</span>
                <span class="time">{{ error.lastSeen }}</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <mat-card class="resources-card">
        <h3>Utilisation des ressources</h3>
        <div class="resources-grid">
          <div class="resource-item">
            <div class="resource-header">
              <span>CPU</span>
              <span>{{ resources.cpu }}%</span>
            </div>
            <div class="resource-bar">
              <div class="bar-fill" [style.width.%]="resources.cpu" [class.warning]="resources.cpu > 70" [class.danger]="resources.cpu > 90"></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <span>Mémoire</span>
              <span>{{ resources.memory }}%</span>
            </div>
            <div class="resource-bar">
              <div class="bar-fill" [style.width.%]="resources.memory" [class.warning]="resources.memory > 70" [class.danger]="resources.memory > 90"></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <span>Disque</span>
              <span>{{ resources.disk }}%</span>
            </div>
            <div class="resource-bar">
              <div class="bar-fill" [style.width.%]="resources.disk" [class.warning]="resources.disk > 70" [class.danger]="resources.disk > 90"></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <span>Connexions DB</span>
              <span>{{ resources.dbConnections }}%</span>
            </div>
            <div class="resource-bar">
              <div class="bar-fill" [style.width.%]="resources.dbConnections" [class.warning]="resources.dbConnections > 70" [class.danger]="resources.dbConnections > 90"></div>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .metrics-dashboard { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } .header-actions { display: flex; gap: 16px; align-items: center; mat-form-field { width: 150px; } } }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 24px; text-align: center; .kpi-value { font-size: 32px; font-weight: 600; } .kpi-label { color: #757575; margin: 8px 0; } .kpi-trend { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 14px; mat-icon { font-size: 18px; width: 18px; height: 18px; } &.up { color: #4caf50; } &.down { color: #f44336; } } }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .chart-card { padding: 24px; h3 { margin: 0 0 16px; } .chart-placeholder { .bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 150px; .bar { flex: 1; background: #1976d2; border-radius: 2px 2px 0 0; transition: height 0.3s; } } .line-chart { height: 150px; svg { width: 100%; height: 100%; } } .chart-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #757575; } } }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .details-card { padding: 24px; h3 { margin: 0 0 16px; } .endpoint-list, .error-list { .endpoint-item, .error-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; } } .endpoint-info { display: flex; align-items: center; gap: 12px; .method { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; &.get { background: #e3f2fd; color: #1976d2; } &.post { background: #e8f5e9; color: #388e3c; } &.put { background: #fff3e0; color: #f57c00; } &.delete { background: #ffebee; color: #d32f2f; } } .path { font-family: monospace; font-size: 14px; } } .endpoint-stats { display: flex; gap: 16px; font-size: 14px; .calls { color: #757575; } .avg-time { font-weight: 500; } } .error-info { display: flex; align-items: center; gap: 12px; .status { background: #ffebee; color: #d32f2f; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; } .message { color: #424242; } } .error-meta { display: flex; gap: 16px; font-size: 14px; color: #757575; .count { color: #d32f2f; font-weight: 500; } } } }
    .resources-card { padding: 24px; h3 { margin: 0 0 16px; } .resources-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; .resource-item { .resource-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500; } .resource-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; .bar-fill { height: 100%; background: #4caf50; border-radius: 4px; transition: width 0.3s; &.warning { background: #ff9800; } &.danger { background: #f44336; } } } } } }
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .charts-grid, .details-grid { grid-template-columns: 1fr; } .resources-card .resources-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class MetricsDashboardComponent {
  period = '24h';

  kpis = {
    requestsPerSecond: 156,
    avgResponseTime: 89,
    errorRate: 0.3,
    activeUsers: 234
  };

  requestsData = [65, 72, 80, 75, 68, 85, 90, 78, 82, 88, 95, 92];
  responseTimeData = [45, 52, 48, 55, 50, 62, 58, 65, 60, 55, 50, 48];

  topEndpoints = [
    { method: 'GET', path: '/api/declarations', calls: 12450, avgTime: 45 },
    { method: 'POST', path: '/api/declarations', calls: 3240, avgTime: 120 },
    { method: 'GET', path: '/api/users/me', calls: 8920, avgTime: 12 },
    { method: 'PUT', path: '/api/declarations/:id', calls: 2180, avgTime: 95 },
    { method: 'GET', path: '/api/notifications', calls: 6540, avgTime: 28 }
  ];

  recentErrors = [
    { status: '500', message: 'Database connection timeout', count: 12, lastSeen: 'Il y a 5min' },
    { status: '404', message: 'Declaration not found', count: 45, lastSeen: 'Il y a 2min' },
    { status: '401', message: 'Invalid authentication token', count: 8, lastSeen: 'Il y a 15min' },
    { status: '400', message: 'Validation error on field niu', count: 23, lastSeen: 'Il y a 8min' }
  ];

  resources = {
    cpu: 35,
    memory: 62,
    disk: 48,
    dbConnections: 22
  };

  getLinePoints(): string {
    return this.responseTimeData.map((v, i) =>
      `${i * (200 / (this.responseTimeData.length - 1))},${100 - v}`
    ).join(' ');
  }
}
