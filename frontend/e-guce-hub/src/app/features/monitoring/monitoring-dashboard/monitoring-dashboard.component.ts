import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MonitoringService, DashboardStats, HealthStatus, Alert } from '@core/services/monitoring.service';

@Component({
  selector: 'hub-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="monitoring-dashboard">
      <div class="page-header">
        <h1>Monitoring 360</h1>
        <p class="page-description">Supervision en temps reel de toutes les instances GUCE</p>
      </div>

      <!-- Global Stats -->
      <div class="grid-container cols-4">
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>apartment</mat-icon></div>
          <div class="stat-value">{{ stats.totalTenants }}</div>
          <div class="stat-label">Instances</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-value">{{ stats.healthyTenants }}</div>
          <div class="stat-label">Saines</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><mat-icon>warning</mat-icon></div>
          <div class="stat-value">{{ stats.degradedTenants }}</div>
          <div class="stat-label">Degradees</div>
        </div>
        <div class="stat-card clickable" routerLink="/monitoring/alerts/active">
          <div class="stat-icon red"><mat-icon>notifications_active</mat-icon></div>
          <div class="stat-value">{{ stats.activeAlerts }}</div>
          <div class="stat-label">Alertes Actives</div>
        </div>
      </div>

      <!-- Health Overview -->
      <div class="grid-container cols-2">
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Sante des Instances</h2>
            <a routerLink="/monitoring/health/overview" class="view-all">Voir tout</a>
          </div>
          <div class="health-grid">
            <div class="health-item" *ngFor="let tenant of healthStatuses"
                 [routerLink]="['/monitoring/health', tenant.tenantId]">
              <div class="health-status" [class]="'status-' + tenant.status.toLowerCase()">
                <mat-icon>{{ getHealthIcon(tenant.status) }}</mat-icon>
              </div>
              <div class="health-info">
                <span class="tenant-name">{{ tenant.tenantName }}</span>
                <span class="tenant-uptime">Uptime: {{ tenant.uptime }}%</span>
              </div>
              <div class="services-status">
                <span class="service-count up">{{ getServicesUp(tenant) }}</span>
                <span>/</span>
                <span class="service-count total">{{ tenant.services.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Alerts -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Alertes Actives</h2>
            <a routerLink="/monitoring/alerts/active" class="view-all">Voir tout</a>
          </div>
          <div class="alerts-list">
            <div class="alert-item" *ngFor="let alert of activeAlerts" [class]="'severity-' + alert.severity.toLowerCase()">
              <mat-icon>{{ getAlertIcon(alert.severity) }}</mat-icon>
              <div class="alert-content">
                <div class="alert-header">
                  <span class="alert-title">{{ alert.title }}</span>
                  <span class="alert-tenant">{{ alert.tenantName }}</span>
                </div>
                <p class="alert-message">{{ alert.message }}</p>
                <span class="alert-time">{{ alert.createdAt | date:'dd/MM HH:mm' }}</span>
              </div>
              <button class="acknowledge-btn" (click)="acknowledgeAlert(alert)" *ngIf="alert.status === 'ACTIVE'">
                <mat-icon>check</mat-icon>
              </button>
            </div>
            <div class="empty-state" *ngIf="activeAlerts.length === 0">
              <mat-icon>check_circle</mat-icon>
              <p>Aucune alerte active</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Overview -->
      <div class="grid-container cols-3">
        <div class="dashboard-card clickable" routerLink="/monitoring/metrics/transactions">
          <div class="card-header">
            <h2>Transactions</h2>
            <span class="metric-period">Aujourd'hui</span>
          </div>
          <div class="metric-display">
            <span class="big-number">{{ stats.totalTransactionsToday | number }}</span>
            <span class="trend positive">
              <mat-icon>trending_up</mat-icon> +12%
            </span>
          </div>
        </div>

        <div class="dashboard-card clickable" routerLink="/monitoring/metrics/users-active">
          <div class="card-header">
            <h2>Utilisateurs Actifs</h2>
            <span class="metric-period">En ce moment</span>
          </div>
          <div class="metric-display">
            <span class="big-number">{{ stats.totalActiveUsers | number }}</span>
            <span class="trend positive">
              <mat-icon>trending_up</mat-icon> +5%
            </span>
          </div>
        </div>

        <div class="dashboard-card clickable" routerLink="/monitoring/metrics/performance">
          <div class="card-header">
            <h2>Temps de Reponse</h2>
            <span class="metric-period">Moyenne</span>
          </div>
          <div class="metric-display">
            <span class="big-number">{{ stats.averageResponseTime }}ms</span>
            <span class="trend negative">
              <mat-icon>trending_down</mat-icon> -8%
            </span>
          </div>
        </div>
      </div>

      <!-- Resources Overview -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Ressources par Instance</h2>
          <a routerLink="/monitoring/resources/by-tenant" class="view-all">Voir detail</a>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Instance</th>
              <th>CPU</th>
              <th>Memoire</th>
              <th>Stockage</th>
              <th>Reseau</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let resource of resourceMetrics">
              <td>{{ resource.tenantName }}</td>
              <td>
                <div class="resource-bar">
                  <div class="bar-fill" [class]="getResourceClass(resource.cpu.percentage)"
                       [style.width.%]="resource.cpu.percentage"></div>
                  <span>{{ resource.cpu.percentage }}%</span>
                </div>
              </td>
              <td>
                <div class="resource-bar">
                  <div class="bar-fill" [class]="getResourceClass(resource.memory.percentage)"
                       [style.width.%]="resource.memory.percentage"></div>
                  <span>{{ resource.memory.percentage }}%</span>
                </div>
              </td>
              <td>
                <div class="resource-bar">
                  <div class="bar-fill" [class]="getResourceClass(resource.storage.percentage)"
                       [style.width.%]="resource.storage.percentage"></div>
                  <span>{{ resource.storage.percentage }}%</span>
                </div>
              </td>
              <td>
                <span class="network-stats">
                  <mat-icon>arrow_downward</mat-icon>{{ formatBytes(resource.network.inbound) }}
                  <mat-icon>arrow_upward</mat-icon>{{ formatBytes(resource.network.outbound) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-bar">
        <a routerLink="/monitoring/reports/daily" class="quick-action">
          <mat-icon>assessment</mat-icon>
          Rapport Journalier
        </a>
        <a routerLink="/monitoring/reports/custom" class="quick-action">
          <mat-icon>tune</mat-icon>
          Rapport Personnalise
        </a>
        <a routerLink="/monitoring/alerts/rules" class="quick-action">
          <mat-icon>rule</mat-icon>
          Regles d'Alerte
        </a>
      </div>
    </div>
  `,
  styles: [`
    .monitoring-dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .stat-card.clickable {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .view-all {
      color: #1a237e;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }

    .health-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .health-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #e3f2fd;
      }

      .health-status {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.status-healthy {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.status-degraded {
          background: #fff3e0;
          color: #f57c00;
        }

        &.status-unhealthy {
          background: #ffebee;
          color: #c62828;
        }
      }

      .health-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .tenant-name {
          font-weight: 500;
        }

        .tenant-uptime {
          font-size: 12px;
          color: #757575;
        }
      }

      .services-status {
        font-size: 14px;

        .up {
          color: #2e7d32;
          font-weight: 600;
        }
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;

      &.severity-critical {
        background: #ffebee;
        border-color: #c62828;

        > mat-icon {
          color: #c62828;
        }
      }

      &.severity-warning {
        background: #fff3e0;
        border-color: #f57c00;

        > mat-icon {
          color: #f57c00;
        }
      }

      &.severity-info {
        background: #e3f2fd;
        border-color: #1565c0;

        > mat-icon {
          color: #1565c0;
        }
      }

      .alert-content {
        flex: 1;

        .alert-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;

          .alert-title {
            font-weight: 500;
          }

          .alert-tenant {
            font-size: 12px;
            color: #757575;
          }
        }

        .alert-message {
          font-size: 13px;
          color: #616161;
          margin: 0 0 4px;
        }

        .alert-time {
          font-size: 11px;
          color: #9e9e9e;
        }
      }

      .acknowledge-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background: rgba(0,0,0,0.1);
        }
      }
    }

    .dashboard-card.clickable {
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }

    .metric-period {
      font-size: 12px;
      color: #9e9e9e;
    }

    .metric-display {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-top: 8px;

      .big-number {
        font-size: 36px;
        font-weight: 500;
      }

      .trend {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &.positive {
          color: #2e7d32;
        }

        &.negative {
          color: #c62828;
        }
      }
    }

    .resource-bar {
      width: 100px;
      height: 20px;
      background: #e0e0e0;
      border-radius: 4px;
      position: relative;
      overflow: hidden;

      .bar-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        transition: width 0.3s;

        &.low { background: #4caf50; }
        &.medium { background: #ff9800; }
        &.high { background: #f44336; }
      }

      span {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        font-weight: 600;
      }
    }

    .network-stats {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #757575;
      }
    }

    .quick-actions-bar {
      display: flex;
      gap: 16px;
      margin-top: 24px;

      .quick-action {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: white;
        border-radius: 8px;
        text-decoration: none;
        color: #1a237e;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 32px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #4caf50;
      }

      p {
        margin-top: 12px;
        color: #757575;
      }
    }
  `]
})
export class MonitoringDashboardComponent implements OnInit {
  private monitoringService = inject(MonitoringService);

  stats: DashboardStats = {
    totalTenants: 0,
    healthyTenants: 0,
    degradedTenants: 0,
    unhealthyTenants: 0,
    activeAlerts: 0,
    totalTransactionsToday: 0,
    totalActiveUsers: 0,
    averageResponseTime: 0
  };

  healthStatuses: HealthStatus[] = [];
  activeAlerts: Alert[] = [];
  resourceMetrics: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Mock data
    this.stats = {
      totalTenants: 5,
      healthyTenants: 3,
      degradedTenants: 1,
      unhealthyTenants: 1,
      activeAlerts: 3,
      totalTransactionsToday: 12458,
      totalActiveUsers: 847,
      averageResponseTime: 245
    };

    this.healthStatuses = [
      { tenantId: '1', tenantName: 'GUCE Cameroun', status: 'HEALTHY', uptime: 99.9, lastCheck: new Date(),
        services: [{ name: 'API', status: 'UP', responseTime: 120 }, { name: 'DB', status: 'UP', responseTime: 45 }] },
      { tenantId: '2', tenantName: 'GUCE Tchad', status: 'DEGRADED', uptime: 95.2, lastCheck: new Date(),
        services: [{ name: 'API', status: 'UP', responseTime: 350 }, { name: 'DB', status: 'DEGRADED', responseTime: 200 }] },
      { tenantId: '3', tenantName: 'GUCE RCA', status: 'HEALTHY', uptime: 98.5, lastCheck: new Date(),
        services: [{ name: 'API', status: 'UP', responseTime: 180 }, { name: 'DB', status: 'UP', responseTime: 60 }] }
    ];

    this.activeAlerts = [
      { id: '1', tenantId: '2', tenantName: 'GUCE Tchad', severity: 'WARNING', title: 'CPU Eleve',
        message: 'Utilisation CPU a 85%', status: 'ACTIVE', createdAt: new Date() },
      { id: '2', tenantId: '1', tenantName: 'GUCE Cameroun', severity: 'INFO', title: 'Mise a jour disponible',
        message: 'Nouvelle version 2.3.0', status: 'ACTIVE', createdAt: new Date(Date.now() - 3600000) }
    ];

    this.resourceMetrics = [
      { tenantId: '1', tenantName: 'GUCE Cameroun',
        cpu: { current: 45, limit: 100, percentage: 45 },
        memory: { current: 6, limit: 16, percentage: 37 },
        storage: { current: 120, limit: 500, percentage: 24 },
        network: { inbound: 125000000, outbound: 85000000 } },
      { tenantId: '2', tenantName: 'GUCE Tchad',
        cpu: { current: 85, limit: 100, percentage: 85 },
        memory: { current: 12, limit: 16, percentage: 75 },
        storage: { current: 200, limit: 500, percentage: 40 },
        network: { inbound: 95000000, outbound: 65000000 } },
      { tenantId: '3', tenantName: 'GUCE RCA',
        cpu: { current: 30, limit: 100, percentage: 30 },
        memory: { current: 4, limit: 8, percentage: 50 },
        storage: { current: 80, limit: 250, percentage: 32 },
        network: { inbound: 45000000, outbound: 30000000 } }
    ];
  }

  getHealthIcon(status: string): string {
    switch (status) {
      case 'HEALTHY': return 'check_circle';
      case 'DEGRADED': return 'warning';
      case 'UNHEALTHY': return 'error';
      default: return 'help';
    }
  }

  getServicesUp(tenant: HealthStatus): number {
    return tenant.services.filter(s => s.status === 'UP').length;
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'WARNING': return 'warning';
      default: return 'info';
    }
  }

  getResourceClass(percentage: number): string {
    if (percentage < 60) return 'low';
    if (percentage < 80) return 'medium';
    return 'high';
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  acknowledgeAlert(alert: Alert): void {
    this.monitoringService.acknowledgeAlert(alert.id).subscribe(() => this.loadData());
  }
}
