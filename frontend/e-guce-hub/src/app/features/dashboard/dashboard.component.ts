import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MonitoringService, DashboardStats } from '@core/services/monitoring.service';
import { TenantService } from '@core/services/tenant.service';
import { Tenant, TenantStatus } from '@core/models/tenant.model';

@Component({
  selector: 'hub-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard E-GUCE 3G Hub</h1>
        <p class="page-description">Vue d'ensemble de toutes les instances GUCE deployees</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid-container cols-4">
        <div class="stat-card">
          <div class="stat-icon blue">
            <mat-icon>apartment</mat-icon>
          </div>
          <div class="stat-value">{{ stats.totalTenants }}</div>
          <div class="stat-label">Total Instances</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-value">{{ stats.healthyTenants }}</div>
          <div class="stat-label">Instances Saines</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="stat-value">{{ stats.degradedTenants }}</div>
          <div class="stat-label">Instances Degradees</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">
            <mat-icon>error</mat-icon>
          </div>
          <div class="stat-value">{{ stats.activeAlerts }}</div>
          <div class="stat-label">Alertes Actives</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid-container cols-2">
        <!-- Tenants Overview -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Instances GUCE</h2>
            <a routerLink="/tenants/dashboard" class="view-all">Voir tout</a>
          </div>
          <div class="tenant-list">
            <div class="tenant-item" *ngFor="let tenant of tenants">
              <div class="tenant-info">
                <div class="tenant-avatar" [style.background]="tenant.primaryColor">
                  {{ tenant.code }}
                </div>
                <div class="tenant-details">
                  <span class="tenant-name">{{ tenant.name }}</span>
                  <span class="tenant-domain">{{ tenant.domain }}</span>
                </div>
              </div>
              <span class="status-badge" [class]="'status-' + tenant.status.toLowerCase()">
                {{ getStatusLabel(tenant.status) }}
              </span>
            </div>
            <div class="empty-state" *ngIf="tenants.length === 0">
              <mat-icon>apartment</mat-icon>
              <p>Aucune instance deployee</p>
              <a routerLink="/tenants/create" class="btn-primary">Creer une instance</a>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Activite Recente</h2>
          </div>
          <div class="activity-feed">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [class]="activity.type">
                <mat-icon>{{ activity.icon }}</mat-icon>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.message }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Overview -->
      <div class="grid-container cols-3">
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Transactions Aujourd'hui</h2>
          </div>
          <div class="metric-value">
            <span class="big-number">{{ stats.totalTransactionsToday | number }}</span>
            <span class="metric-trend positive">
              <mat-icon>trending_up</mat-icon> +12%
            </span>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header">
            <h2>Utilisateurs Actifs</h2>
          </div>
          <div class="metric-value">
            <span class="big-number">{{ stats.totalActiveUsers | number }}</span>
            <span class="metric-trend positive">
              <mat-icon>trending_up</mat-icon> +5%
            </span>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header">
            <h2>Temps de Reponse Moyen</h2>
          </div>
          <div class="metric-value">
            <span class="big-number">{{ stats.averageResponseTime }}ms</span>
            <span class="metric-trend negative">
              <mat-icon>trending_down</mat-icon> -8%
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Actions Rapides</h2>
        </div>
        <div class="quick-actions">
          <a routerLink="/tenants/create" class="action-card">
            <mat-icon>add_circle</mat-icon>
            <span>Nouvelle Instance</span>
          </a>
          <a routerLink="/generator/procedures" class="action-card">
            <mat-icon>code</mat-icon>
            <span>Generer Procedure</span>
          </a>
          <a routerLink="/monitoring/dashboard" class="action-card">
            <mat-icon>monitoring</mat-icon>
            <span>Monitoring 360</span>
          </a>
          <a routerLink="/templates/procedures/import" class="action-card">
            <mat-icon>library_books</mat-icon>
            <span>Bibliotheque Templates</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .view-all {
      color: #1a237e;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }

    .tenant-list {
      .tenant-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }
      }

      .tenant-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .tenant-avatar {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
      }

      .tenant-details {
        display: flex;
        flex-direction: column;

        .tenant-name {
          font-weight: 500;
          color: #333;
        }

        .tenant-domain {
          font-size: 12px;
          color: #757575;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #bdbdbd;
      }

      p {
        color: #757575;
        margin: 12px 0 20px;
      }
    }

    .activity-feed {
      .activity-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }
      }

      .activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.warning {
          background: #fff3e0;
          color: #f57c00;
        }

        &.info {
          background: #e3f2fd;
          color: #1565c0;
        }

        &.error {
          background: #ffebee;
          color: #c62828;
        }
      }

      .activity-content {
        flex: 1;

        .activity-text {
          margin: 0 0 4px;
          font-size: 14px;
          color: #333;
        }

        .activity-time {
          font-size: 12px;
          color: #9e9e9e;
        }
      }
    }

    .metric-value {
      display: flex;
      align-items: baseline;
      gap: 12px;

      .big-number {
        font-size: 36px;
        font-weight: 500;
        color: #333;
      }

      .metric-trend {
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

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: #f5f5f5;
        border-radius: 8px;
        text-decoration: none;
        color: #333;
        transition: all 0.2s;

        &:hover {
          background: #e3f2fd;
          transform: translateY(-2px);
        }

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #1a237e;
        }

        span {
          font-weight: 500;
          text-align: center;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private monitoringService = inject(MonitoringService);
  private tenantService = inject(TenantService);

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

  tenants: Tenant[] = [];

  recentActivities = [
    { type: 'success', icon: 'check_circle', message: 'GUCE Cameroun deploye avec succes', time: 'Il y a 5 min' },
    { type: 'info', icon: 'code', message: 'Generation procedure Import terminee', time: 'Il y a 15 min' },
    { type: 'warning', icon: 'warning', message: 'GUCE Tchad: Utilisation CPU elevee', time: 'Il y a 30 min' },
    { type: 'success', icon: 'person_add', message: 'Nouvel utilisateur cree sur GUCE RCA', time: 'Il y a 1h' },
    { type: 'info', icon: 'sync', message: 'Synchronisation templates terminee', time: 'Il y a 2h' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Mock data for demo - replace with real API calls
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

    this.tenants = [
      {
        id: '1',
        code: 'CM',
        name: 'GUCE Cameroun',
        shortName: 'GUCE-CM',
        domain: 'guce-cameroun.com',
        country: 'CM',
        primaryColor: '#1E5631',
        secondaryColor: '#CE1126',
        timezone: 'Africa/Douala',
        locale: 'fr-CM',
        currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      },
      {
        id: '2',
        code: 'TD',
        name: 'GUCE Tchad',
        shortName: 'GUCE-TD',
        domain: 'guce-tchad.com',
        country: 'TD',
        primaryColor: '#002664',
        secondaryColor: '#FECB00',
        timezone: 'Africa/Ndjamena',
        locale: 'fr-TD',
        currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      },
      {
        id: '3',
        code: 'CF',
        name: 'GUCE RCA',
        shortName: 'GUCE-CF',
        domain: 'guce-rca.com',
        country: 'CF',
        primaryColor: '#003082',
        secondaryColor: '#289728',
        timezone: 'Africa/Bangui',
        locale: 'fr-CF',
        currency: 'XAF',
        status: TenantStatus.MAINTENANCE,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      }
    ];
  }

  getStatusLabel(status: TenantStatus): string {
    const labels: Record<TenantStatus, string> = {
      [TenantStatus.PENDING]: 'En attente',
      [TenantStatus.PROVISIONING]: 'Provisionnement',
      [TenantStatus.RUNNING]: 'En cours',
      [TenantStatus.STOPPED]: 'Arrete',
      [TenantStatus.ERROR]: 'Erreur',
      [TenantStatus.MAINTENANCE]: 'Maintenance'
    };
    return labels[status] || status;
  }
}
