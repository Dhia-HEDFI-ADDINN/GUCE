import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'guce-health-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="health-status">
      <div class="page-header">
        <h1>État du système</h1>
        <div class="header-actions">
          <span class="last-check">Dernière vérification: {{ lastCheck }}</span>
          <button mat-stroked-button (click)="refreshStatus()">
            <mat-icon>refresh</mat-icon> Actualiser
          </button>
        </div>
      </div>

      <div class="overall-status" [class]="overallStatus">
        <mat-icon>{{ overallStatus === 'healthy' ? 'check_circle' : overallStatus === 'degraded' ? 'warning' : 'error' }}</mat-icon>
        <div class="status-text">
          <h2>{{ getOverallStatusLabel() }}</h2>
          <p>{{ getOverallStatusDescription() }}</p>
        </div>
      </div>

      <div class="services-grid">
        <mat-card class="service-card" *ngFor="let service of services" [class]="service.status">
          <div class="service-header">
            <mat-icon>{{ service.icon }}</mat-icon>
            <span class="service-name">{{ service.name }}</span>
            <span class="status-indicator" [class]="service.status" [matTooltip]="getStatusLabel(service.status)">
              <mat-icon>{{ getStatusIcon(service.status) }}</mat-icon>
            </span>
          </div>

          <div class="service-details">
            <div class="detail-row">
              <span class="label">Temps de réponse</span>
              <span class="value">{{ service.responseTime }}ms</span>
            </div>
            <div class="detail-row">
              <span class="label">Uptime (30j)</span>
              <span class="value">{{ service.uptime }}%</span>
            </div>
            <div class="detail-row" *ngIf="service.version">
              <span class="label">Version</span>
              <span class="value">{{ service.version }}</span>
            </div>
          </div>

          <mat-progress-bar *ngIf="service.load !== undefined"
                            mode="determinate" [value]="service.load"
                            [color]="service.load > 80 ? 'warn' : 'primary'">
          </mat-progress-bar>
          <span class="load-label" *ngIf="service.load !== undefined">Charge: {{ service.load }}%</span>
        </mat-card>
      </div>

      <mat-card class="dependencies-card">
        <h3>Services externes</h3>
        <div class="dependency-list">
          <div class="dependency-item" *ngFor="let dep of externalServices" [class]="dep.status">
            <mat-icon>{{ getStatusIcon(dep.status) }}</mat-icon>
            <span class="dep-name">{{ dep.name }}</span>
            <span class="dep-endpoint">{{ dep.endpoint }}</span>
            <span class="dep-response">{{ dep.responseTime }}ms</span>
            <span class="dep-status" [class]="dep.status">{{ getStatusLabel(dep.status) }}</span>
          </div>
        </div>
      </mat-card>

      <div class="metrics-grid">
        <mat-card class="metric-card">
          <h4>Mémoire</h4>
          <div class="metric-value">{{ metrics.memory.used }} / {{ metrics.memory.total }} GB</div>
          <mat-progress-bar mode="determinate" [value]="(metrics.memory.used / metrics.memory.total) * 100"
                            [color]="metrics.memory.used / metrics.memory.total > 0.8 ? 'warn' : 'primary'">
          </mat-progress-bar>
        </mat-card>

        <mat-card class="metric-card">
          <h4>CPU</h4>
          <div class="metric-value">{{ metrics.cpu }}%</div>
          <mat-progress-bar mode="determinate" [value]="metrics.cpu"
                            [color]="metrics.cpu > 80 ? 'warn' : 'primary'">
          </mat-progress-bar>
        </mat-card>

        <mat-card class="metric-card">
          <h4>Stockage</h4>
          <div class="metric-value">{{ metrics.storage.used }} / {{ metrics.storage.total }} GB</div>
          <mat-progress-bar mode="determinate" [value]="(metrics.storage.used / metrics.storage.total) * 100"
                            [color]="metrics.storage.used / metrics.storage.total > 0.8 ? 'warn' : 'primary'">
          </mat-progress-bar>
        </mat-card>

        <mat-card class="metric-card">
          <h4>Connexions DB</h4>
          <div class="metric-value">{{ metrics.dbConnections.active }} / {{ metrics.dbConnections.max }}</div>
          <mat-progress-bar mode="determinate" [value]="(metrics.dbConnections.active / metrics.dbConnections.max) * 100">
          </mat-progress-bar>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .health-status { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } .header-actions { display: flex; align-items: center; gap: 16px; .last-check { color: #757575; font-size: 14px; } } }
    .overall-status { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 12px; margin-bottom: 24px; &.healthy { background: #e8f5e9; mat-icon { color: #4caf50; } } &.degraded { background: #fff3e0; mat-icon { color: #ff9800; } } &.unhealthy { background: #ffebee; mat-icon { color: #f44336; } } mat-icon { font-size: 48px; width: 48px; height: 48px; } .status-text { h2 { margin: 0 0 4px; } p { margin: 0; color: #757575; } } }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .service-card { padding: 20px; &.unhealthy { border-left: 4px solid #f44336; } &.degraded { border-left: 4px solid #ff9800; } .service-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; mat-icon { color: #1976d2; } .service-name { flex: 1; font-weight: 500; } .status-indicator { mat-icon { font-size: 20px; width: 20px; height: 20px; } &.healthy mat-icon { color: #4caf50; } &.degraded mat-icon { color: #ff9800; } &.unhealthy mat-icon { color: #f44336; } } } .service-details { margin-bottom: 12px; .detail-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; .label { color: #757575; } } } .load-label { font-size: 12px; color: #757575; margin-top: 4px; display: block; } }
    .dependencies-card { padding: 24px; margin-bottom: 24px; h3 { margin: 0 0 16px; } .dependency-list { .dependency-item { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; } mat-icon { font-size: 20px; width: 20px; height: 20px; } &.healthy mat-icon { color: #4caf50; } &.degraded mat-icon { color: #ff9800; } &.unhealthy mat-icon { color: #f44336; } .dep-name { width: 150px; font-weight: 500; } .dep-endpoint { flex: 1; color: #757575; font-size: 13px; } .dep-response { width: 80px; text-align: right; } .dep-status { width: 80px; text-align: center; padding: 4px 8px; border-radius: 4px; font-size: 12px; &.healthy { background: #e8f5e9; color: #2e7d32; } &.degraded { background: #fff3e0; color: #ef6c00; } &.unhealthy { background: #ffebee; color: #c62828; } } } } }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { padding: 20px; h4 { margin: 0 0 8px; color: #757575; font-weight: 500; } .metric-value { font-size: 18px; font-weight: 600; margin-bottom: 12px; } }
    @media (max-width: 1024px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class HealthStatusComponent {
  lastCheck = '15/01/2024 10:30:45';
  overallStatus = 'healthy';

  services = [
    { name: 'API Gateway', icon: 'api', status: 'healthy', responseTime: 45, uptime: 99.98, version: '2.1.0', load: 35 },
    { name: 'Base de données', icon: 'storage', status: 'healthy', responseTime: 12, uptime: 99.99, version: 'PostgreSQL 15', load: 42 },
    { name: 'Cache Redis', icon: 'memory', status: 'healthy', responseTime: 2, uptime: 99.95, load: 28 },
    { name: 'File Storage', icon: 'folder', status: 'healthy', responseTime: 85, uptime: 99.90, load: 65 },
    { name: 'Message Queue', icon: 'message', status: 'healthy', responseTime: 8, uptime: 99.97, version: 'RabbitMQ 3.12' },
    { name: 'Keycloak SSO', icon: 'security', status: 'healthy', responseTime: 120, uptime: 99.85, version: '23.0.1' }
  ];

  externalServices = [
    { name: 'Banque Centrale', endpoint: 'api.beac.int', status: 'healthy', responseTime: 245 },
    { name: 'SYDONIA', endpoint: 'sydonia.douanes.gov', status: 'healthy', responseTime: 180 },
    { name: 'Service Portuaire', endpoint: 'api.port.cm', status: 'degraded', responseTime: 890 },
    { name: 'SMS Gateway', endpoint: 'sms.provider.com', status: 'healthy', responseTime: 120 }
  ];

  metrics = {
    memory: { used: 12.4, total: 32 },
    cpu: 35,
    storage: { used: 245, total: 500 },
    dbConnections: { active: 45, max: 200 }
  };

  getOverallStatusLabel(): string {
    const labels: Record<string, string> = { healthy: 'Tous les systèmes opérationnels', degraded: 'Performance dégradée', unhealthy: 'Problèmes détectés' };
    return labels[this.overallStatus] || '';
  }

  getOverallStatusDescription(): string {
    const desc: Record<string, string> = {
      healthy: 'Tous les services fonctionnent normalement',
      degraded: 'Certains services ont des temps de réponse élevés',
      unhealthy: 'Un ou plusieurs services sont indisponibles'
    };
    return desc[this.overallStatus] || '';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = { healthy: 'check_circle', degraded: 'warning', unhealthy: 'error' };
    return icons[status] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { healthy: 'OK', degraded: 'Dégradé', unhealthy: 'Erreur' };
    return labels[status] || status;
  }

  refreshStatus(): void {
    this.lastCheck = new Date().toLocaleString('fr-FR');
  }
}
