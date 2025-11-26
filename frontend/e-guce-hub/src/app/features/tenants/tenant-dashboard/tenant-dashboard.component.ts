import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TenantService } from '@core/services/tenant.service';
import { Tenant, TenantStatus } from '@core/models/tenant.model';

@Component({
  selector: 'hub-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="tenant-dashboard">
      <div class="page-header">
        <div>
          <h1>Tenant Builder</h1>
          <p class="page-description">Gerez toutes les instances GUCE deployees</p>
        </div>
        <div class="header-actions">
          <a routerLink="/tenants/create" class="btn-primary">
            <mat-icon>add</mat-icon>
            Nouvelle Instance
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-container cols-4">
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>apartment</mat-icon></div>
          <div class="stat-value">{{ tenants.length }}</div>
          <div class="stat-label">Total Instances</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>play_circle</mat-icon></div>
          <div class="stat-value">{{ getCountByStatus(TenantStatus.RUNNING) }}</div>
          <div class="stat-label">En Cours</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><mat-icon>build</mat-icon></div>
          <div class="stat-value">{{ getCountByStatus(TenantStatus.MAINTENANCE) }}</div>
          <div class="stat-label">En Maintenance</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><mat-icon>error</mat-icon></div>
          <div class="stat-value">{{ getCountByStatus(TenantStatus.ERROR) }}</div>
          <div class="stat-label">En Erreur</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-input">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Rechercher une instance..." [(ngModel)]="searchTerm" (input)="filterTenants()" />
        </div>
        <div class="filter-buttons">
          <button [class.active]="statusFilter === 'all'" (click)="setStatusFilter('all')">Tous</button>
          <button [class.active]="statusFilter === 'running'" (click)="setStatusFilter('running')">En Cours</button>
          <button [class.active]="statusFilter === 'stopped'" (click)="setStatusFilter('stopped')">Arretes</button>
          <button [class.active]="statusFilter === 'error'" (click)="setStatusFilter('error')">En Erreur</button>
        </div>
      </div>

      <!-- Tenant Cards -->
      <div class="tenant-grid">
        <div class="tenant-card" *ngFor="let tenant of filteredTenants">
          <div class="tenant-header">
            <div class="tenant-avatar" [style.background]="tenant.primaryColor">
              {{ tenant.code }}
            </div>
            <div class="tenant-info">
              <h3>{{ tenant.name }}</h3>
              <a [href]="'https://' + tenant.domain" target="_blank" class="tenant-url">
                {{ tenant.domain }}
                <mat-icon>open_in_new</mat-icon>
              </a>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="tenantMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #tenantMenu="matMenu">
              <button mat-menu-item [routerLink]="['/tenants', tenant.id, 'overview']">
                <mat-icon>visibility</mat-icon> Vue d'ensemble
              </button>
              <button mat-menu-item [routerLink]="['/tenants', tenant.id, 'config']">
                <mat-icon>settings</mat-icon> Configuration
              </button>
              <button mat-menu-item [routerLink]="['/tenants', tenant.id, 'logs']">
                <mat-icon>article</mat-icon> Logs
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="restartTenant(tenant)" *ngIf="tenant.status === TenantStatus.RUNNING">
                <mat-icon>refresh</mat-icon> Redemarrer
              </button>
              <button mat-menu-item (click)="stopTenant(tenant)" *ngIf="tenant.status === TenantStatus.RUNNING">
                <mat-icon>stop</mat-icon> Arreter
              </button>
              <button mat-menu-item (click)="startTenant(tenant)" *ngIf="tenant.status === TenantStatus.STOPPED">
                <mat-icon>play_arrow</mat-icon> Demarrer
              </button>
            </mat-menu>
          </div>

          <div class="tenant-status">
            <span class="status-badge" [class]="'status-' + tenant.status.toLowerCase()">
              {{ getStatusLabel(tenant.status) }}
            </span>
            <span class="tenant-country">
              <mat-icon>location_on</mat-icon> {{ tenant.country }}
            </span>
          </div>

          <div class="tenant-modules">
            <span class="module-badge" *ngFor="let module of getActiveModules(tenant)">
              {{ module }}
            </span>
          </div>

          <div class="tenant-metrics" *ngIf="tenant.health">
            <div class="metric">
              <span class="metric-label">Uptime</span>
              <span class="metric-value">{{ tenant.health.uptime }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Services</span>
              <span class="metric-value">{{ getHealthyServices(tenant) }}/{{ tenant.health.services?.length || 0 }}</span>
            </div>
          </div>

          <div class="tenant-actions">
            <a [routerLink]="['/tenants', tenant.id, 'overview']" class="btn-secondary">
              Gerer
            </a>
            <a [routerLink]="['/monitoring/health', tenant.id]" class="btn-secondary">
              Monitoring
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredTenants.length === 0">
        <mat-icon>apartment</mat-icon>
        <h3>Aucune instance trouvee</h3>
        <p *ngIf="searchTerm || statusFilter !== 'all'">Modifiez vos filtres ou votre recherche</p>
        <p *ngIf="!searchTerm && statusFilter === 'all'">Creez votre premiere instance GUCE</p>
        <a routerLink="/tenants/create" class="btn-primary" *ngIf="!searchTerm && statusFilter === 'all'">
          Creer une instance
        </a>
      </div>
    </div>
  `,
  styles: [`
    .tenant-dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
    }

    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      .search-input {
        display: flex;
        align-items: center;
        gap: 8px;
        background: white;
        padding: 10px 16px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        min-width: 300px;

        input {
          border: none;
          outline: none;
          font-size: 14px;
          width: 100%;
        }

        mat-icon {
          color: #9e9e9e;
        }
      }

      .filter-buttons {
        display: flex;
        gap: 8px;

        button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            border-color: #1a237e;
            color: #1a237e;
          }

          &.active {
            background: #1a237e;
            color: white;
            border-color: #1a237e;
          }
        }
      }
    }

    .tenant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .tenant-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }
    }

    .tenant-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;

      .tenant-avatar {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
      }

      .tenant-info {
        flex: 1;

        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .tenant-url {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #1a237e;
          text-decoration: none;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .tenant-status {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .tenant-country {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #757575;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .tenant-modules {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;

      .module-badge {
        padding: 4px 10px;
        background: #e3f2fd;
        color: #1565c0;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
    }

    .tenant-metrics {
      display: flex;
      gap: 24px;
      padding: 12px 0;
      border-top: 1px solid #f5f5f5;
      border-bottom: 1px solid #f5f5f5;
      margin-bottom: 16px;

      .metric {
        display: flex;
        flex-direction: column;

        .metric-label {
          font-size: 12px;
          color: #9e9e9e;
        }

        .metric-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .tenant-actions {
      display: flex;
      gap: 12px;

      .btn-secondary {
        flex: 1;
        text-align: center;
        text-decoration: none;
        font-size: 13px;
        padding: 8px 16px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #bdbdbd;
      }

      h3 {
        margin: 16px 0 8px;
        color: #333;
      }

      p {
        color: #757575;
        margin-bottom: 20px;
      }
    }
  `]
})
export class TenantDashboardComponent implements OnInit {
  private tenantService = inject(TenantService);

  TenantStatus = TenantStatus;
  tenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  searchTerm = '';
  statusFilter = 'all';

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    // Mock data - replace with actual API call
    this.tenants = [
      {
        id: '1', code: 'CM', name: 'GUCE Cameroun', shortName: 'GUCE-CM',
        domain: 'guce-cameroun.com', country: 'Cameroun',
        primaryColor: '#1E5631', secondaryColor: '#CE1126',
        timezone: 'Africa/Douala', locale: 'fr-CM', currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(), updatedAt: new Date(),
        modules: [
          { name: 'e-Force', enabled: true, features: [] },
          { name: 'e-Gov', enabled: true, features: [] },
          { name: 'e-Business', enabled: true, features: [] },
          { name: 'e-Payment', enabled: true, features: [] }
        ],
        infrastructure: {} as any,
        health: { status: 'HEALTHY', lastCheck: new Date(), uptime: 99.9, services: [
          { name: 'API', status: 'UP' }, { name: 'DB', status: 'UP' }, { name: 'Keycloak', status: 'UP' }
        ]}
      },
      {
        id: '2', code: 'TD', name: 'GUCE Tchad', shortName: 'GUCE-TD',
        domain: 'guce-tchad.com', country: 'Tchad',
        primaryColor: '#002664', secondaryColor: '#FECB00',
        timezone: 'Africa/Ndjamena', locale: 'fr-TD', currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(), updatedAt: new Date(),
        modules: [
          { name: 'e-Force', enabled: true, features: [] },
          { name: 'e-Gov', enabled: true, features: [] }
        ],
        infrastructure: {} as any,
        health: { status: 'HEALTHY', lastCheck: new Date(), uptime: 98.5, services: [
          { name: 'API', status: 'UP' }, { name: 'DB', status: 'UP' }, { name: 'Keycloak', status: 'UP' }
        ]}
      },
      {
        id: '3', code: 'CF', name: 'GUCE RCA', shortName: 'GUCE-CF',
        domain: 'guce-rca.com', country: 'Centrafrique',
        primaryColor: '#003082', secondaryColor: '#289728',
        timezone: 'Africa/Bangui', locale: 'fr-CF', currency: 'XAF',
        status: TenantStatus.MAINTENANCE,
        createdAt: new Date(), updatedAt: new Date(),
        modules: [
          { name: 'e-Force', enabled: true, features: [] },
          { name: 'e-Gov', enabled: true, features: [] },
          { name: 'e-Business', enabled: true, features: [] }
        ],
        infrastructure: {} as any
      }
    ];
    this.filteredTenants = [...this.tenants];
  }

  filterTenants(): void {
    this.filteredTenants = this.tenants.filter(tenant => {
      const matchesSearch = !this.searchTerm ||
        tenant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'running' && tenant.status === TenantStatus.RUNNING) ||
        (this.statusFilter === 'stopped' && tenant.status === TenantStatus.STOPPED) ||
        (this.statusFilter === 'error' && tenant.status === TenantStatus.ERROR);

      return matchesSearch && matchesStatus;
    });
  }

  setStatusFilter(filter: string): void {
    this.statusFilter = filter;
    this.filterTenants();
  }

  getCountByStatus(status: TenantStatus): number {
    return this.tenants.filter(t => t.status === status).length;
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
    return labels[status];
  }

  getActiveModules(tenant: Tenant): string[] {
    return tenant.modules?.filter(m => m.enabled).map(m => m.name) || [];
  }

  getHealthyServices(tenant: Tenant): number {
    return tenant.health?.services?.filter(s => s.status === 'UP').length || 0;
  }

  startTenant(tenant: Tenant): void {
    this.tenantService.start(tenant.id).subscribe(() => this.loadTenants());
  }

  stopTenant(tenant: Tenant): void {
    this.tenantService.stop(tenant.id).subscribe(() => this.loadTenants());
  }

  restartTenant(tenant: Tenant): void {
    this.tenantService.restart(tenant.id).subscribe(() => this.loadTenants());
  }
}
