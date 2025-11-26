import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '@env/environment';

interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
  route: string;
}

interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'guce-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Banner -->
      <div class="welcome-banner" [style.background]="'linear-gradient(135deg, ' + primaryColor + ' 0%, ' + secondaryColor + ' 100%)'">
        <div class="welcome-content">
          <h1>Bienvenue, {{ userName }}</h1>
          <p>Plateforme GUCE {{ instanceName }} - Guichet Unique du Commerce Extérieur</p>
        </div>
        <div class="welcome-illustration">
          <mat-icon>hub</mat-icon>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card *ngFor="let stat of visibleStats" class="stat-card" [routerLink]="stat.route">
          <div class="stat-icon" [style.background]="stat.color">
            <mat-icon>{{ stat.icon }}</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-trend" *ngIf="stat.trend" [class.positive]="stat.trend > 0" [class.negative]="stat.trend < 0">
              <mat-icon>{{ stat.trend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
          </div>
        </mat-card>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Quick Actions -->
          <mat-card class="quick-actions-card">
            <mat-card-header>
              <mat-card-title>Actions rapides</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="actions-grid">
                <button mat-flat-button class="action-btn" routerLink="/e-force/declarations/new/import" *ngIf="hasRole('OPERATEUR_ECONOMIQUE')">
                  <mat-icon>file_upload</mat-icon>
                  <span>Nouvelle Import</span>
                </button>
                <button mat-flat-button class="action-btn" routerLink="/e-force/declarations/new/export" *ngIf="hasRole('OPERATEUR_ECONOMIQUE')">
                  <mat-icon>file_download</mat-icon>
                  <span>Nouvelle Export</span>
                </button>
                <button mat-flat-button class="action-btn" routerLink="/e-force/procedures" *ngIf="hasRole('OPERATEUR_ECONOMIQUE')">
                  <mat-icon>assignment</mat-icon>
                  <span>Procédures</span>
                </button>
                <button mat-flat-button class="action-btn" routerLink="/e-gov/inbox" *ngIf="hasRole('AGENT_ADMINISTRATION')">
                  <mat-icon>inbox</mat-icon>
                  <span>Corbeille</span>
                </button>
                <button mat-flat-button class="action-btn" routerLink="/e-gov/processing" *ngIf="hasRole('AGENT_ADMINISTRATION')">
                  <mat-icon>pending_actions</mat-icon>
                  <span>Traitement</span>
                </button>
                <button mat-flat-button class="action-btn" routerLink="/e-payment/history">
                  <mat-icon>payment</mat-icon>
                  <span>Paiements</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent Declarations -->
          <mat-card class="declarations-card" *ngIf="hasRole('OPERATEUR_ECONOMIQUE')">
            <mat-card-header>
              <mat-card-title>Déclarations récentes</mat-card-title>
              <button mat-button color="primary" routerLink="/e-force/declarations/import">Voir tout</button>
            </mat-card-header>
            <mat-card-content>
              <div class="declaration-list">
                <div class="declaration-item" *ngFor="let decl of recentDeclarations">
                  <div class="decl-icon" [class]="decl.type">
                    <mat-icon>{{ getDeclarationIcon(decl.type) }}</mat-icon>
                  </div>
                  <div class="decl-info">
                    <span class="decl-ref">{{ decl.reference }}</span>
                    <span class="decl-desc">{{ decl.description }}</span>
                  </div>
                  <div class="decl-status" [class]="decl.status">
                    {{ getStatusLabel(decl.status) }}
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Pending Tasks (for Admin) -->
          <mat-card class="tasks-card" *ngIf="hasRole('AGENT_ADMINISTRATION')">
            <mat-card-header>
              <mat-card-title>Dossiers en attente</mat-card-title>
              <button mat-button color="primary" routerLink="/e-gov/inbox">Voir tout</button>
            </mat-card-header>
            <mat-card-content>
              <div class="task-list">
                <div class="task-item" *ngFor="let task of pendingTasks">
                  <div class="task-priority" [class]="task.priority"></div>
                  <div class="task-info">
                    <span class="task-ref">{{ task.reference }}</span>
                    <span class="task-type">{{ task.type }}</span>
                  </div>
                  <div class="task-date">{{ task.date }}</div>
                  <button mat-icon-button [routerLink]="['/e-gov/processing', task.id]">
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Activity Feed -->
          <mat-card class="activity-card">
            <mat-card-header>
              <mat-card-title>Activité récente</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                <div class="activity-item" *ngFor="let activity of recentActivity">
                  <div class="activity-icon" [class]="activity.type">
                    <mat-icon>{{ activity.icon }}</mat-icon>
                  </div>
                  <div class="activity-content">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-desc">{{ activity.description }}</span>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Workflow Progress -->
          <mat-card class="workflow-card" *ngIf="hasRole('OPERATEUR_ECONOMIQUE')">
            <mat-card-header>
              <mat-card-title>Progression des dossiers</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="workflow-stats">
                <div class="workflow-item">
                  <div class="workflow-header">
                    <span>En cours de traitement</span>
                    <span class="workflow-count">{{ workflowStats.processing }}</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="workflowStats.processingPercent" color="primary"></mat-progress-bar>
                </div>
                <div class="workflow-item">
                  <div class="workflow-header">
                    <span>En attente de paiement</span>
                    <span class="workflow-count">{{ workflowStats.pendingPayment }}</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="workflowStats.pendingPaymentPercent" color="warn"></mat-progress-bar>
                </div>
                <div class="workflow-item">
                  <div class="workflow-header">
                    <span>Approuvés ce mois</span>
                    <span class="workflow-count">{{ workflowStats.approved }}</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="workflowStats.approvedPercent" color="accent"></mat-progress-bar>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Announcements -->
          <mat-card class="announcements-card">
            <mat-card-header>
              <mat-card-title>Annonces</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="announcement-list">
                <div class="announcement-item" *ngFor="let ann of announcements">
                  <mat-icon [class]="ann.type">{{ ann.type === 'important' ? 'campaign' : 'info' }}</mat-icon>
                  <div class="announcement-content">
                    <span class="announcement-title">{{ ann.title }}</span>
                    <span class="announcement-date">{{ ann.date }}</span>
                  </div>
                </div>
                <div class="no-announcements" *ngIf="announcements.length === 0">
                  <mat-icon>notifications_none</mat-icon>
                  <p>Aucune annonce</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-banner {
      border-radius: 16px;
      padding: 32px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .welcome-content {
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px;
        }
        p {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }
      }

      .welcome-illustration mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        opacity: 0.3;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          color: white;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      .stat-content {
        display: flex;
        flex-direction: column;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
        }

        .stat-label {
          font-size: 13px;
          color: #757575;
        }

        .stat-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }

          &.positive { color: #4caf50; }
          &.negative { color: #f44336; }
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    mat-card {
      border-radius: 12px;

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        mat-card-title {
          font-size: 18px;
          font-weight: 600;
        }
      }
    }

    .quick-actions-card {
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          height: auto;
          background: #f5f5f5;
          color: #333;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          span {
            font-size: 12px;
            text-transform: none;
          }

          &:hover {
            background: #e0e0e0;
          }
        }
      }
    }

    .declaration-list {
      .declaration-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .decl-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.import { background: #e3f2fd; color: #1976d2; }
          &.export { background: #e8f5e9; color: #388e3c; }
          &.transit { background: #fff3e0; color: #f57c00; }
        }

        .decl-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .decl-ref {
            font-weight: 500;
            font-size: 14px;
          }

          .decl-desc {
            font-size: 12px;
            color: #757575;
          }
        }

        .decl-status {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;

          &.draft { background: #f5f5f5; color: #616161; }
          &.submitted { background: #e3f2fd; color: #1976d2; }
          &.processing { background: #fff3e0; color: #f57c00; }
          &.approved { background: #e8f5e9; color: #388e3c; }
          &.rejected { background: #ffebee; color: #c62828; }
        }
      }
    }

    .task-list {
      .task-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .task-priority {
          width: 4px;
          height: 40px;
          border-radius: 2px;

          &.high { background: #f44336; }
          &.medium { background: #ff9800; }
          &.low { background: #4caf50; }
        }

        .task-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .task-ref {
            font-weight: 500;
            font-size: 14px;
          }

          .task-type {
            font-size: 12px;
            color: #757575;
          }
        }

        .task-date {
          font-size: 12px;
          color: #9e9e9e;
        }
      }
    }

    .activity-list {
      .activity-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
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

          &.success { background: #e8f5e9; color: #388e3c; }
          &.warning { background: #fff3e0; color: #f57c00; }
          &.info { background: #e3f2fd; color: #1976d2; }
          &.error { background: #ffebee; color: #c62828; }
        }

        .activity-content {
          flex: 1;
          display: flex;
          flex-direction: column;

          .activity-title {
            font-weight: 500;
            font-size: 14px;
          }

          .activity-desc {
            font-size: 12px;
            color: #757575;
          }

          .activity-time {
            font-size: 11px;
            color: #9e9e9e;
            margin-top: 4px;
          }
        }
      }
    }

    .workflow-stats {
      .workflow-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .workflow-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;

          .workflow-count {
            font-weight: 600;
          }
        }
      }
    }

    .announcement-list {
      .announcement-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        mat-icon {
          &.important { color: #f57c00; }
          &.info { color: #1976d2; }
        }

        .announcement-content {
          flex: 1;
          display: flex;
          flex-direction: column;

          .announcement-title {
            font-weight: 500;
            font-size: 14px;
          }

          .announcement-date {
            font-size: 12px;
            color: #9e9e9e;
          }
        }
      }

      .no-announcements {
        text-align: center;
        padding: 24px;
        color: #9e9e9e;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }

        p {
          margin: 8px 0 0;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private keycloak = inject(KeycloakService);

  primaryColor = environment.branding.primaryColor;
  secondaryColor = environment.branding.secondaryColor;
  instanceName = environment.instance.name;
  userName = '';
  userRoles: string[] = [];

  // Stats for operators
  operatorStats: StatCard[] = [
    { icon: 'file_upload', label: 'Imports en cours', value: 12, trend: 8, color: '#1976d2', route: '/e-force/declarations/import' },
    { icon: 'file_download', label: 'Exports en cours', value: 5, trend: -3, color: '#388e3c', route: '/e-force/declarations/export' },
    { icon: 'pending', label: 'En attente', value: 8, color: '#f57c00', route: '/e-force/declarations/import' },
    { icon: 'check_circle', label: 'Approuvées', value: 156, trend: 12, color: '#4caf50', route: '/e-force/declarations/import' }
  ];

  // Stats for admins
  adminStats: StatCard[] = [
    { icon: 'inbox', label: 'Corbeille', value: 45, color: '#1976d2', route: '/e-gov/inbox' },
    { icon: 'pending_actions', label: 'En traitement', value: 23, color: '#f57c00', route: '/e-gov/processing' },
    { icon: 'task_alt', label: 'Traités aujourd\'hui', value: 18, trend: 5, color: '#4caf50', route: '/e-gov/decisions' },
    { icon: 'schedule', label: 'Délai moyen', value: '2.5j', color: '#9c27b0', route: '/e-gov/statistics' }
  ];

  visibleStats: StatCard[] = [];

  recentDeclarations = [
    { reference: 'IMP-2024-001234', type: 'import', description: 'Équipements informatiques', status: 'processing' },
    { reference: 'EXP-2024-005678', type: 'export', description: 'Produits agricoles', status: 'approved' },
    { reference: 'IMP-2024-001235', type: 'import', description: 'Véhicules automobiles', status: 'submitted' },
    { reference: 'TRS-2024-000123', type: 'transit', description: 'Marchandises en transit', status: 'draft' }
  ];

  pendingTasks = [
    { id: '1', reference: 'IMP-2024-001234', type: 'Déclaration Import', date: 'Aujourd\'hui', priority: 'high' },
    { id: '2', reference: 'EXP-2024-005678', type: 'Certificat Origine', date: 'Hier', priority: 'medium' },
    { id: '3', reference: 'IMP-2024-001236', type: 'Inspection', date: 'Il y a 2j', priority: 'low' }
  ];

  recentActivity: RecentActivity[] = [
    { icon: 'check_circle', title: 'Déclaration approuvée', description: 'IMP-2024-001233 validée par les Douanes', time: 'Il y a 5 min', type: 'success' },
    { icon: 'payment', title: 'Paiement reçu', description: 'Droits et taxes pour IMP-2024-001232', time: 'Il y a 30 min', type: 'info' },
    { icon: 'warning', title: 'Document manquant', description: 'Certificat requis pour EXP-2024-005677', time: 'Il y a 1h', type: 'warning' },
    { icon: 'send', title: 'Déclaration soumise', description: 'IMP-2024-001234 envoyée pour traitement', time: 'Il y a 2h', type: 'info' }
  ];

  workflowStats = {
    processing: 12,
    processingPercent: 60,
    pendingPayment: 5,
    pendingPaymentPercent: 25,
    approved: 156,
    approvedPercent: 78
  };

  announcements = [
    { type: 'important', title: 'Maintenance prévue le 15/12', date: '10/12/2024' },
    { type: 'info', title: 'Nouvelle procédure d\'import simplifiée', date: '05/12/2024' }
  ];

  async ngOnInit() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = profile.firstName || 'Utilisateur';
      this.userRoles = this.keycloak.getUserRoles();

      // Show appropriate stats based on role
      if (this.hasRole('AGENT_ADMINISTRATION') || this.hasRole('AGENT_DOUANE')) {
        this.visibleStats = this.adminStats;
      } else {
        this.visibleStats = this.operatorStats;
      }
    } catch {
      this.userName = 'Utilisateur';
      this.visibleStats = this.operatorStats;
    }
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role) || this.userRoles.includes('SUPER_ADMIN_INSTANCE');
  }

  getDeclarationIcon(type: string): string {
    switch (type) {
      case 'import': return 'file_upload';
      case 'export': return 'file_download';
      case 'transit': return 'local_shipping';
      default: return 'description';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumise',
      processing: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  }
}
