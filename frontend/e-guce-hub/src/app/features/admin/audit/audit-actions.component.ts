import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { AuditService, AuditLog, AuditAction, AuditCategory, AuditSearchParams } from '@core/services/audit.service';

@Component({
  selector: 'hub-audit-actions',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatIconModule, MatMenuModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatPaginatorModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Journal d'Audit</h1>
          <p class="page-description">Tracabilite de toutes les actions effectuees dans le systeme</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportLogs()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button class="btn-secondary" (click)="refreshLogs()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>history</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ totalLogs }}</span>
            <span class="stat-label">Total Actions</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ successCount }}</span>
            <span class="stat-label">Reussies</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><mat-icon>error</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ failureCount }}</span>
            <span class="stat-label">Echouees</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><mat-icon>people</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ uniqueUsers }}</span>
            <span class="stat-label">Utilisateurs</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchParams.search" (ngModelChange)="onSearchChange()" placeholder="Utilisateur, ressource...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categorie</mat-label>
            <mat-select [(ngModel)]="searchParams.category" (selectionChange)="applyFilters()">
              <mat-option [value]="null">Toutes</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat.value">{{ cat.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Action</mat-label>
            <mat-select [(ngModel)]="searchParams.action" (selectionChange)="applyFilters()">
              <mat-option [value]="null">Toutes</mat-option>
              <mat-option *ngFor="let action of actions" [value]="action.value">{{ action.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="searchParams.status" (selectionChange)="applyFilters()">
              <mat-option [value]="null">Tous</mat-option>
              <mat-option value="SUCCESS">Reussi</mat-option>
              <mat-option value="FAILURE">Echoue</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date debut</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="applyFilters()">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date fin</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="applyFilters()">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="active-filters" *ngIf="hasActiveFilters">
          <span class="filter-label">Filtres actifs:</span>
          <button class="filter-chip" *ngIf="searchParams.category" (click)="clearFilter('category')">
            {{ getCategoryLabel(searchParams.category) }} <mat-icon>close</mat-icon>
          </button>
          <button class="filter-chip" *ngIf="searchParams.action" (click)="clearFilter('action')">
            {{ getActionLabel(searchParams.action) }} <mat-icon>close</mat-icon>
          </button>
          <button class="filter-chip" *ngIf="searchParams.status" (click)="clearFilter('status')">
            {{ searchParams.status === 'SUCCESS' ? 'Reussi' : 'Echoue' }} <mat-icon>close</mat-icon>
          </button>
          <button class="clear-all" (click)="clearAllFilters()">Effacer tout</button>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="audit-table-card">
        <div class="table-header">
          <h3>Historique des Actions</h3>
          <span class="table-count">{{ logs.length }} sur {{ totalLogs }}</span>
        </div>

        <div class="audit-table" *ngIf="!loading && logs.length > 0">
          <div class="audit-row header">
            <div class="col-time">Date/Heure</div>
            <div class="col-user">Utilisateur</div>
            <div class="col-action">Action</div>
            <div class="col-resource">Ressource</div>
            <div class="col-status">Statut</div>
            <div class="col-details">Details</div>
          </div>

          <div class="audit-row" *ngFor="let log of logs" [class.failed]="log.status === 'FAILURE'">
            <div class="col-time">
              <span class="time-date">{{ log.timestamp | date:'dd/MM/yyyy' }}</span>
              <span class="time-hour">{{ log.timestamp | date:'HH:mm:ss' }}</span>
            </div>
            <div class="col-user">
              <div class="user-info">
                <span class="user-name">{{ log.userName }}</span>
                <span class="user-email">{{ log.userEmail }}</span>
              </div>
            </div>
            <div class="col-action">
              <span class="action-badge" [class]="'action-' + getCategoryClass(log.category)">
                <mat-icon>{{ getCategoryIcon(log.category) }}</mat-icon>
                {{ getActionLabel(log.action) }}
              </span>
            </div>
            <div class="col-resource">
              <span class="resource-type">{{ log.resourceType }}</span>
              <span class="resource-name">{{ log.resourceName || log.resourceId }}</span>
            </div>
            <div class="col-status">
              <span class="status-badge" [class]="'status-' + log.status.toLowerCase()">
                <mat-icon>{{ log.status === 'SUCCESS' ? 'check_circle' : 'error' }}</mat-icon>
                {{ log.status === 'SUCCESS' ? 'Reussi' : 'Echoue' }}
              </span>
            </div>
            <div class="col-details">
              <button class="btn-icon" [matMenuTriggerFor]="detailsMenu" matTooltip="Voir les details">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #detailsMenu="matMenu">
                <div class="details-menu">
                  <div class="detail-item">
                    <span class="detail-label">IP</span>
                    <span class="detail-value">{{ log.ipAddress }}</span>
                  </div>
                  <div class="detail-item" *ngIf="log.tenantName">
                    <span class="detail-label">Tenant</span>
                    <span class="detail-value">{{ log.tenantName }}</span>
                  </div>
                  <div class="detail-item" *ngIf="log.sessionId">
                    <span class="detail-label">Session</span>
                    <span class="detail-value">{{ log.sessionId | slice:0:8 }}...</span>
                  </div>
                  <div class="detail-item" *ngIf="log.errorMessage">
                    <span class="detail-label error">Erreur</span>
                    <span class="detail-value error">{{ log.errorMessage }}</span>
                  </div>
                  <div class="detail-changes" *ngIf="log.changes?.length">
                    <span class="detail-label">Modifications</span>
                    <div class="change-item" *ngFor="let change of log.changes">
                      <span class="change-field">{{ change.field }}</span>
                      <span class="change-old">{{ change.oldValue | json }}</span>
                      <mat-icon>arrow_forward</mat-icon>
                      <span class="change-new">{{ change.newValue | json }}</span>
                    </div>
                  </div>
                </div>
              </mat-menu>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && logs.length === 0">
          <mat-icon>history</mat-icon>
          <h3>Aucune action trouvee</h3>
          <p>Modifiez vos filtres pour voir plus de resultats</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <mat-icon class="spinning">sync</mat-icon>
          <p>Chargement des logs...</p>
        </div>

        <mat-paginator
          *ngIf="totalLogs > 0"
          [length]="totalLogs"
          [pageSize]="pageSize"
          [pageSizeOptions]="[20, 50, 100]"
          [pageIndex]="pageIndex"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1600px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 24px; margin-bottom: 8px; }
    .page-description { color: #757575; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-secondary {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; background: white; border: 1px solid #e0e0e0;
      border-radius: 8px; cursor: pointer; font-size: 14px;
    }
    .btn-secondary:hover { background: #f5f5f5; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      background: white; border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .stat-icon.blue { background: #1565c0; }
    .stat-icon.green { background: #2e7d32; }
    .stat-icon.red { background: #c62828; }
    .stat-icon.orange { background: #f57c00; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 13px; color: #757575; }

    .filters-card {
      background: white; border-radius: 12px; padding: 20px;
      margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .filters-row {
      display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;
    }
    .search-field { flex: 1; min-width: 200px; }
    ::ng-deep .mat-mdc-form-field { margin-bottom: 0; }

    .active-filters {
      display: flex; align-items: center; gap: 8px;
      margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;
    }
    .filter-label { font-size: 13px; color: #757575; }
    .filter-chip {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 12px; background: #e3f2fd; color: #1565c0;
      border: none; border-radius: 16px; font-size: 12px; cursor: pointer;
    }
    .filter-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .clear-all {
      margin-left: auto; background: none; border: none;
      color: #1a237e; font-size: 13px; cursor: pointer;
    }

    .audit-table-card {
      background: white; border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08); overflow: hidden;
    }
    .table-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #eee;
    }
    .table-header h3 { font-size: 16px; margin: 0; }
    .table-count { font-size: 13px; color: #757575; }

    .audit-table { overflow-x: auto; }
    .audit-row {
      display: grid;
      grid-template-columns: 120px 180px 180px 1fr 100px 50px;
      align-items: center; padding: 12px 24px;
      border-bottom: 1px solid #f5f5f5;
    }
    .audit-row.header {
      font-size: 12px; font-weight: 600; color: #757575;
      text-transform: uppercase; background: #fafafa;
    }
    .audit-row:not(.header):hover { background: #fafafa; }
    .audit-row.failed { background: #fff5f5; }

    .col-time {
      display: flex; flex-direction: column;
    }
    .time-date { font-size: 13px; }
    .time-hour { font-size: 11px; color: #9e9e9e; }

    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 500; }
    .user-email { font-size: 11px; color: #9e9e9e; }

    .action-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 4px; font-size: 12px;
    }
    .action-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .action-authentication { background: #e8f5e9; color: #2e7d32; }
    .action-user { background: #e3f2fd; color: #1565c0; }
    .action-tenant { background: #fff3e0; color: #f57c00; }
    .action-security { background: #fce4ec; color: #c2185b; }
    .action-data { background: #f3e5f5; color: #7b1fa2; }
    .action-config { background: #e0f2f1; color: #00796b; }

    .resource-type { font-size: 11px; color: #9e9e9e; display: block; }
    .resource-name { font-size: 13px; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: 4px; font-size: 11px;
    }
    .status-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .status-success { background: #e8f5e9; color: #2e7d32; }
    .status-failure { background: #ffebee; color: #c62828; }

    .btn-icon {
      background: none; border: none; padding: 4px;
      border-radius: 4px; cursor: pointer; color: #757575;
    }
    .btn-icon:hover { background: #f5f5f5; }

    .details-menu { padding: 12px; min-width: 250px; }
    .detail-item {
      display: flex; justify-content: space-between;
      padding: 8px 0; border-bottom: 1px solid #f5f5f5;
    }
    .detail-label { font-size: 12px; color: #757575; }
    .detail-value { font-size: 12px; font-weight: 500; }
    .detail-label.error, .detail-value.error { color: #c62828; }
    .detail-changes { margin-top: 12px; }
    .change-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; padding: 4px 0;
    }
    .change-field { font-weight: 500; color: #1a237e; }
    .change-old { color: #c62828; text-decoration: line-through; }
    .change-new { color: #2e7d32; }
    .change-item mat-icon { font-size: 12px; width: 12px; height: 12px; color: #9e9e9e; }

    .empty-state, .loading-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 60px; color: #757575;
    }
    .empty-state mat-icon, .loading-state mat-icon {
      font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .audit-row { font-size: 12px; }
    }
  `]
})
export class AuditActionsComponent implements OnInit, OnDestroy {
  private auditService = inject(AuditService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  logs: AuditLog[] = [];
  totalLogs = 0;
  pageIndex = 0;
  pageSize = 50;
  loading = true;

  successCount = 0;
  failureCount = 0;
  uniqueUsers = 0;

  searchParams: AuditSearchParams = {};
  startDate: Date | null = null;
  endDate: Date | null = null;

  categories = [
    { value: AuditCategory.AUTHENTICATION, label: 'Authentification' },
    { value: AuditCategory.USER_MANAGEMENT, label: 'Utilisateurs' },
    { value: AuditCategory.TENANT_MANAGEMENT, label: 'Tenants' },
    { value: AuditCategory.CONFIGURATION, label: 'Configuration' },
    { value: AuditCategory.SECURITY, label: 'Securite' },
    { value: AuditCategory.BILLING, label: 'Facturation' }
  ];

  actions = [
    { value: AuditAction.LOGIN, label: 'Connexion' },
    { value: AuditAction.LOGOUT, label: 'Deconnexion' },
    { value: AuditAction.CREATE, label: 'Creation' },
    { value: AuditAction.UPDATE, label: 'Modification' },
    { value: AuditAction.DELETE, label: 'Suppression' },
    { value: AuditAction.EXPORT, label: 'Export' },
    { value: AuditAction.STATUS_CHANGE, label: 'Changement statut' }
  ];

  get hasActiveFilters(): boolean {
    return !!(this.searchParams.category || this.searchParams.action ||
              this.searchParams.status || this.startDate || this.endDate);
  }

  ngOnInit(): void {
    this.loadLogs();

    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs(): void {
    this.loading = true;
    const params: AuditSearchParams = {
      ...this.searchParams,
      page: this.pageIndex,
      size: this.pageSize
    };

    if (this.startDate) params.startDate = this.startDate.toISOString();
    if (this.endDate) params.endDate = this.endDate.toISOString();

    this.auditService.searchLogs(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.logs = response.content || [];
        this.totalLogs = response.totalElements || 0;
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.logs = this.getMockLogs();
        this.totalLogs = this.logs.length;
        this.calculateStats();
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchParams.search || '');
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadLogs();
  }

  clearFilter(filter: string): void {
    switch (filter) {
      case 'category': this.searchParams.category = undefined; break;
      case 'action': this.searchParams.action = undefined; break;
      case 'status': this.searchParams.status = undefined; break;
    }
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchParams = {};
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  refreshLogs(): void {
    this.loadLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  exportLogs(): void {
    this.auditService.exportLogs(this.searchParams, 'xlsx').subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getCategoryLabel(category: AuditCategory): string {
    const found = this.categories.find(c => c.value === category);
    return found?.label || category;
  }

  getActionLabel(action: AuditAction): string {
    const found = this.actions.find(a => a.value === action);
    return found?.label || action;
  }

  getCategoryIcon(category: AuditCategory): string {
    const icons: Record<AuditCategory, string> = {
      [AuditCategory.AUTHENTICATION]: 'login',
      [AuditCategory.USER_MANAGEMENT]: 'person',
      [AuditCategory.ROLE_MANAGEMENT]: 'admin_panel_settings',
      [AuditCategory.TENANT_MANAGEMENT]: 'apartment',
      [AuditCategory.BILLING]: 'payment',
      [AuditCategory.CONFIGURATION]: 'settings',
      [AuditCategory.GENERATOR]: 'build',
      [AuditCategory.MONITORING]: 'monitoring',
      [AuditCategory.SECURITY]: 'security'
    };
    return icons[category] || 'history';
  }

  getCategoryClass(category: AuditCategory): string {
    const classes: Record<AuditCategory, string> = {
      [AuditCategory.AUTHENTICATION]: 'authentication',
      [AuditCategory.USER_MANAGEMENT]: 'user',
      [AuditCategory.ROLE_MANAGEMENT]: 'user',
      [AuditCategory.TENANT_MANAGEMENT]: 'tenant',
      [AuditCategory.BILLING]: 'data',
      [AuditCategory.CONFIGURATION]: 'config',
      [AuditCategory.GENERATOR]: 'data',
      [AuditCategory.MONITORING]: 'data',
      [AuditCategory.SECURITY]: 'security'
    };
    return classes[category] || 'data';
  }

  private calculateStats(): void {
    this.successCount = this.logs.filter(l => l.status === 'SUCCESS').length;
    this.failureCount = this.logs.filter(l => l.status === 'FAILURE').length;
    this.uniqueUsers = new Set(this.logs.map(l => l.userId)).size;
  }

  private getMockLogs(): AuditLog[] {
    return [
      {
        id: '1', timestamp: new Date().toISOString(),
        action: AuditAction.LOGIN, category: AuditCategory.AUTHENTICATION,
        userId: 'u1', userName: 'Admin Super', userEmail: 'admin@e-guce.cm',
        resourceType: 'SESSION', resourceId: 's1',
        description: 'Connexion reussie', ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120', status: 'SUCCESS'
      },
      {
        id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: AuditAction.CREATE, category: AuditCategory.TENANT_MANAGEMENT,
        userId: 'u1', userName: 'Admin Super', userEmail: 'admin@e-guce.cm',
        tenantId: 't1', tenantName: 'GUCE-CM',
        resourceType: 'TENANT', resourceId: 't1', resourceName: 'GUCE Cameroun',
        description: 'Creation instance GUCE-CM', ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120', status: 'SUCCESS'
      },
      {
        id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: AuditAction.UPDATE, category: AuditCategory.CONFIGURATION,
        userId: 'u2', userName: 'Tech Admin', userEmail: 'tech@e-guce.cm',
        resourceType: 'CONFIG', resourceId: 'smtp', resourceName: 'SMTP Settings',
        description: 'Modification configuration SMTP', ipAddress: '192.168.1.101',
        userAgent: 'Firefox/119', status: 'SUCCESS',
        changes: [
          { field: 'host', oldValue: 'smtp.old.com', newValue: 'smtp.new.com' },
          { field: 'port', oldValue: 25, newValue: 587 }
        ]
      },
      {
        id: '4', timestamp: new Date(Date.now() - 10800000).toISOString(),
        action: AuditAction.LOGIN_FAILED, category: AuditCategory.AUTHENTICATION,
        userId: 'unknown', userName: 'unknown', userEmail: 'hacker@test.com',
        resourceType: 'SESSION', resourceId: 's2',
        description: 'Tentative de connexion echouee', ipAddress: '203.0.113.50',
        userAgent: 'Unknown', status: 'FAILURE', errorMessage: 'Invalid credentials'
      }
    ];
  }
}
