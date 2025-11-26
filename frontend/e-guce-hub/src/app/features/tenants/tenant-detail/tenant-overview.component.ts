import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { TenantService } from '@core/services/tenant.service';
import { Tenant, TenantStatus, TenantMetrics, DeploymentStatus } from '@core/models/tenant.model';

@Component({
  selector: 'hub-tenant-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressBarModule, MatMenuModule],
  template: `
    <div class="tenant-overview" *ngIf="tenant">
      <!-- Header with Actions -->
      <div class="overview-header">
        <div class="tenant-identity">
          <div class="tenant-logo" [style.background]="tenant.primaryColor">
            {{ tenant.code }}
          </div>
          <div class="tenant-info">
            <h1>{{ tenant.name }}</h1>
            <p class="tenant-domain">{{ tenant.domain }}</p>
          </div>
          <span class="status-badge" [class]="'status-' + tenant.status.toLowerCase()">
            {{ getStatusLabel(tenant.status) }}
          </span>
        </div>

        <div class="header-actions">
          <ng-container *ngIf="tenant.status === 'RUNNING'">
            <button class="btn-secondary" (click)="openInstance()">
              <mat-icon>open_in_new</mat-icon>
              Ouvrir l'Instance
            </button>
          </ng-container>

          <button class="btn-secondary" [matMenuTriggerFor]="actionsMenu">
            <mat-icon>more_vert</mat-icon>
            Actions
          </button>

          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item (click)="startTenant()" *ngIf="tenant.status === 'STOPPED'">
              <mat-icon>play_arrow</mat-icon>
              <span>Demarrer</span>
            </button>
            <button mat-menu-item (click)="stopTenant()" *ngIf="tenant.status === 'RUNNING'">
              <mat-icon>stop</mat-icon>
              <span>Arreter</span>
            </button>
            <button mat-menu-item (click)="restartTenant()" *ngIf="tenant.status === 'RUNNING'">
              <mat-icon>refresh</mat-icon>
              <span>Redemarrer</span>
            </button>
            <button mat-menu-item (click)="deployTenant()" *ngIf="tenant.status === 'PENDING'">
              <mat-icon>rocket_launch</mat-icon>
              <span>Deployer</span>
            </button>
            <button mat-menu-item (click)="setMaintenance(true)" *ngIf="tenant.status === 'RUNNING'">
              <mat-icon>build</mat-icon>
              <span>Mode Maintenance</span>
            </button>
            <button mat-menu-item (click)="setMaintenance(false)" *ngIf="tenant.status === 'MAINTENANCE'">
              <mat-icon>check_circle</mat-icon>
              <span>Fin Maintenance</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Deployment Progress -->
      <div class="deployment-card" *ngIf="deploymentStatus && deploymentStatus.status !== 'COMPLETED'">
        <div class="deployment-header">
          <h3>
            <mat-icon class="spinning" *ngIf="deploymentStatus.status === 'PROVISIONING'">sync</mat-icon>
            Deploiement en cours
          </h3>
          <span class="progress-text">{{ deploymentStatus.progress }}%</span>
        </div>
        <mat-progress-bar mode="determinate" [value]="deploymentStatus.progress"></mat-progress-bar>
        <div class="deployment-steps">
          <div class="step" *ngFor="let step of deploymentStatus.steps" [class]="step.status">
            <mat-icon *ngIf="step.status === 'completed'">check_circle</mat-icon>
            <mat-icon *ngIf="step.status === 'running'" class="spinning">sync</mat-icon>
            <mat-icon *ngIf="step.status === 'pending'">radio_button_unchecked</mat-icon>
            <mat-icon *ngIf="step.status === 'failed'">error</mat-icon>
            <span>{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>people</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ metrics?.activeUsers || 0 }}</span>
            <span class="stat-label">Utilisateurs Actifs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>receipt_long</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ metrics?.transactions?.today || 0 }}</span>
            <span class="stat-label">Transactions Aujourd'hui</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><mat-icon>speed</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ metrics?.responseTime || 0 }}ms</span>
            <span class="stat-label">Temps de Reponse</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" [class.green]="tenant.health?.status === 'HEALTHY'"
               [class.orange]="tenant.health?.status === 'DEGRADED'"
               [class.red]="tenant.health?.status === 'UNHEALTHY'">
            <mat-icon>favorite</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ tenant.health?.uptime || 0 }}%</span>
            <span class="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Instance Details -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Informations Instance</h3>
            <a routerLink="../config" class="edit-link">Modifier</a>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Code</span><span class="info-value">{{ tenant.code }}</span></div>
            <div class="info-item"><span class="info-label">Pays</span><span class="info-value">{{ tenant.country }}</span></div>
            <div class="info-item"><span class="info-label">Devise</span><span class="info-value">{{ tenant.currency }}</span></div>
            <div class="info-item"><span class="info-label">Fuseau</span><span class="info-value">{{ tenant.timezone }}</span></div>
            <div class="info-item"><span class="info-label">Locale</span><span class="info-value">{{ tenant.locale }}</span></div>
            <div class="info-item"><span class="info-label">Cree le</span><span class="info-value">{{ tenant.createdAt | date:'dd/MM/yyyy' }}</span></div>
          </div>
        </div>

        <!-- Modules -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Modules Actifs</h3>
            <a routerLink="../modules" class="edit-link">Gerer</a>
          </div>
          <div class="modules-list">
            <div class="module-item" *ngFor="let module of tenant.modules" [class.enabled]="module.enabled">
              <mat-icon>{{ getModuleIcon(module.name) }}</mat-icon>
              <div class="module-info">
                <span class="module-name">{{ getModuleLabel(module.name) }}</span>
                <span class="module-features">{{ module.features?.length || 0 }} fonctionnalites</span>
              </div>
              <mat-icon class="status-icon" [class.enabled]="module.enabled">
                {{ module.enabled ? 'check_circle' : 'cancel' }}
              </mat-icon>
            </div>
          </div>
        </div>

        <!-- Infrastructure -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Infrastructure</h3>
            <a routerLink="../resources" class="edit-link">Details</a>
          </div>
          <div class="info-grid" *ngIf="tenant.infrastructure">
            <div class="info-item"><span class="info-label">Provider</span><span class="info-value">{{ tenant.infrastructure.provider }}</span></div>
            <div class="info-item"><span class="info-label">Region</span><span class="info-value">{{ tenant.infrastructure.region }}</span></div>
            <div class="info-item"><span class="info-label">K8s</span><span class="info-value">v{{ tenant.infrastructure.kubernetesVersion }}</span></div>
            <div class="info-item"><span class="info-label">Noeuds</span><span class="info-value">{{ tenant.infrastructure.nodeCount }}</span></div>
            <div class="info-item"><span class="info-label">DB</span><span class="info-value">{{ tenant.infrastructure.databaseType }}</span></div>
            <div class="info-item"><span class="info-label">Stockage</span><span class="info-value">{{ tenant.infrastructure.storageSize }}</span></div>
          </div>
        </div>

        <!-- URLs -->
        <div class="dashboard-card">
          <div class="card-header"><h3>URLs & Endpoints</h3></div>
          <div class="urls-list">
            <div class="url-item">
              <span class="url-label">Frontend</span>
              <a [href]="'https://' + tenant.domain" target="_blank" class="url-value">
                https://{{ tenant.domain }} <mat-icon>open_in_new</mat-icon>
              </a>
            </div>
            <div class="url-item">
              <span class="url-label">API Gateway</span>
              <span class="url-value">https://{{ tenant.domain }}/api</span>
            </div>
            <div class="url-item">
              <span class="url-label">Keycloak Realm</span>
              <span class="url-value">guce-{{ tenant.code.toLowerCase() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading">
      <mat-icon class="spinning">sync</mat-icon>
      <p>Chargement...</p>
    </div>
  `,
  styles: [`
    .tenant-overview { max-width: 1400px; margin: 0 auto; }

    .overview-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; background: white; border-radius: 12px;
      padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .tenant-identity { display: flex; align-items: center; gap: 16px; }
    .tenant-logo {
      width: 64px; height: 64px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 24px;
    }
    .tenant-info h1 { font-size: 24px; margin: 0 0 4px; }
    .tenant-domain { color: #757575; margin: 0; }
    .status-badge {
      padding: 6px 16px; border-radius: 20px; font-size: 12px;
      font-weight: 600; text-transform: uppercase;
    }
    .status-running { background: #e8f5e9; color: #2e7d32; }
    .status-stopped { background: #fafafa; color: #757575; }
    .status-pending { background: #fff3e0; color: #f57c00; }
    .status-provisioning { background: #e3f2fd; color: #1565c0; }
    .status-error { background: #ffebee; color: #c62828; }
    .status-maintenance { background: #fce4ec; color: #c2185b; }

    .header-actions { display: flex; gap: 12px; }
    .btn-secondary {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; background: #f5f5f5;
      border: 1px solid #e0e0e0; border-radius: 8px;
      cursor: pointer; font-size: 14px;
    }
    .btn-secondary:hover { background: #e8eaf6; }

    .deployment-card {
      background: white; border-radius: 12px; padding: 24px;
      margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      border-left: 4px solid #1565c0;
    }
    .deployment-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .deployment-header h3 { display: flex; align-items: center; gap: 8px; margin: 0; color: #1565c0; }
    .progress-text { font-size: 18px; font-weight: 600; color: #1565c0; }
    .deployment-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 16px; }
    .step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9e9e9e; }
    .step mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .step.completed { color: #2e7d32; }
    .step.running { color: #1565c0; }
    .step.failed { color: #c62828; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: white; border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .stat-icon.green { background: #2e7d32; }
    .stat-icon.blue { background: #1565c0; }
    .stat-icon.orange { background: #f57c00; }
    .stat-icon.red { background: #c62828; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 13px; color: #757575; }

    .content-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .dashboard-card {
      background: white; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-size: 16px; margin: 0; }
    .edit-link { color: #1a237e; text-decoration: none; font-size: 13px; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 12px; color: #9e9e9e; }
    .info-value { font-size: 14px; font-weight: 500; }

    .modules-list { display: flex; flex-direction: column; gap: 8px; }
    .module-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px; background: #f5f5f5; opacity: 0.6;
    }
    .module-item.enabled { background: #e8f5e9; opacity: 1; }
    .module-item mat-icon { color: #1a237e; }
    .module-info { flex: 1; display: flex; flex-direction: column; }
    .module-name { font-weight: 500; }
    .module-features { font-size: 12px; color: #757575; }
    .status-icon.enabled { color: #2e7d32; }
    .status-icon:not(.enabled) { color: #9e9e9e; }

    .urls-list { display: flex; flex-direction: column; gap: 12px; }
    .url-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; background: #f5f5f5; border-radius: 8px;
    }
    .url-label { font-size: 13px; color: #757575; }
    .url-value { display: flex; align-items: center; gap: 4px; color: #1a237e; text-decoration: none; font-size: 13px; }
    .url-value mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; color: #757575; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
      .deployment-steps { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class TenantOverviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private destroy$ = new Subject<void>();

  tenant: Tenant | null = null;
  metrics: TenantMetrics | null = null;
  deploymentStatus: DeploymentStatus | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadTenant();
    this.subscribeToDeployment();
    interval(30000).pipe(
      takeUntil(this.destroy$),
      filter(() => !!this.tenant && this.tenant.status === TenantStatus.RUNNING)
    ).subscribe(() => this.loadMetrics());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTenant(): void {
    const tenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (!tenantId) return;
    this.tenantService.getById(tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.loading = false;
        if (tenant.status === TenantStatus.RUNNING) this.loadMetrics();
      },
      error: () => this.loading = false
    });
  }

  private loadMetrics(): void {
    if (!this.tenant) return;
    this.tenantService.getMetrics(this.tenant.id).subscribe({
      next: (metrics) => this.metrics = metrics
    });
  }

  private subscribeToDeployment(): void {
    this.tenantService.getDeploymentProgress().pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.deploymentStatus = status;
      if (status?.status === 'COMPLETED') this.loadTenant();
    });
  }

  openInstance(): void {
    if (this.tenant) window.open(`https://${this.tenant.domain}`, '_blank');
  }

  startTenant(): void {
    if (!this.tenant) return;
    this.tenantService.start(this.tenant.id).subscribe({ next: () => this.loadTenant() });
  }

  stopTenant(): void {
    if (!this.tenant) return;
    this.tenantService.stop(this.tenant.id).subscribe({ next: () => this.loadTenant() });
  }

  restartTenant(): void {
    if (!this.tenant) return;
    this.tenantService.restart(this.tenant.id).subscribe({ next: () => this.loadTenant() });
  }

  deployTenant(): void {
    if (!this.tenant) return;
    this.tenantService.deploy(this.tenant.id).subscribe({ next: () => this.loadTenant() });
  }

  setMaintenance(enabled: boolean): void {
    if (!this.tenant) return;
    this.tenantService.setMaintenance(this.tenant.id, enabled).subscribe({ next: () => this.loadTenant() });
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

  getModuleIcon(name: string): string {
    const icons: Record<string, string> = {
      'e-force': 'business_center', 'e-gov': 'account_balance',
      'e-business': 'storefront', 'e-payment': 'payment',
      'procedure-builder': 'build', 'admin-local': 'admin_panel_settings'
    };
    return icons[name] || 'extension';
  }

  getModuleLabel(name: string): string {
    const labels: Record<string, string> = {
      'e-force': 'e-Force', 'e-gov': 'e-Gov', 'e-business': 'e-Business',
      'e-payment': 'e-Payment', 'procedure-builder': 'Procedure Builder', 'admin-local': 'Admin Local'
    };
    return labels[name] || name;
  }
}
