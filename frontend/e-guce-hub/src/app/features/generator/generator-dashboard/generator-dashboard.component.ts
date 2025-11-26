import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GeneratorService, GenerationJob } from '@core/services/generator.service';

@Component({
  selector: 'hub-generator-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="generator-dashboard">
      <div class="page-header">
        <h1>Generator Engine</h1>
        <p class="page-description">Generateur de code Low-Code pour les instances GUCE</p>
      </div>

      <!-- Stats -->
      <div class="grid-container cols-4">
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>code</mat-icon></div>
          <div class="stat-value">{{ stats.totalJobs }}</div>
          <div class="stat-label">Total Generations</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><mat-icon>pending</mat-icon></div>
          <div class="stat-value">{{ stats.runningJobs }}</div>
          <div class="stat-label">En Cours</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-value">{{ stats.completedJobs }}</div>
          <div class="stat-label">Terminees</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><mat-icon>error</mat-icon></div>
          <div class="stat-value">{{ stats.failedJobs }}</div>
          <div class="stat-label">Echouees</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Actions de Generation</h2>
        </div>
        <div class="action-grid">
          <a routerLink="/generator/procedures" class="action-card">
            <mat-icon>account_tree</mat-icon>
            <div class="action-content">
              <h3>Generer Procedure</h3>
              <p>Creer une nouvelle procedure complete avec workflow, formulaires et regles</p>
            </div>
          </a>
          <a routerLink="/generator/entities" class="action-card">
            <mat-icon>storage</mat-icon>
            <div class="action-content">
              <h3>Generer Entite</h3>
              <p>Creer des entites metier avec API REST et interfaces generees</p>
            </div>
          </a>
          <a routerLink="/generator/frontends" class="action-card">
            <mat-icon>web</mat-icon>
            <div class="action-content">
              <h3>Generer Frontend</h3>
              <p>Creer des composants Angular (listes, formulaires, dashboards)</p>
            </div>
          </a>
          <a routerLink="/generator/infrastructure" class="action-card">
            <mat-icon>cloud</mat-icon>
            <div class="action-content">
              <h3>Generer Infrastructure</h3>
              <p>Creer des fichiers Terraform et Helm pour le deploiement</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Jobs -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Generations Recentes</h2>
          <a routerLink="/generator/history" class="view-all">Voir l'historique</a>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Instance</th>
              <th>Statut</th>
              <th>Progression</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let job of recentJobs">
              <td>
                <div class="job-type">
                  <mat-icon>{{ getJobIcon(job.type) }}</mat-icon>
                  {{ getJobTypeLabel(job.type) }}
                </div>
              </td>
              <td>{{ job.tenantName }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + job.status.toLowerCase()">
                  {{ getStatusLabel(job.status) }}
                </span>
              </td>
              <td>
                <div class="progress-bar" *ngIf="job.status === 'RUNNING'">
                  <div class="progress-fill" [style.width.%]="job.progress"></div>
                  <span>{{ job.progress }}%</span>
                </div>
                <span *ngIf="job.status !== 'RUNNING'">-</span>
              </td>
              <td>{{ job.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <button class="icon-btn" (click)="viewJob(job)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button class="icon-btn" *ngIf="job.status === 'COMPLETED'" (click)="downloadOutput(job)">
                  <mat-icon>download</mat-icon>
                </button>
                <button class="icon-btn" *ngIf="job.status === 'FAILED'" (click)="retryJob(job)">
                  <mat-icon>refresh</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="recentJobs.length === 0">
          <mat-icon>code</mat-icon>
          <p>Aucune generation recente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .generator-dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .action-card {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;

      &:hover {
        background: #e3f2fd;
        transform: translateX(4px);
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #1a237e;
      }

      .action-content {
        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #757575;
        }
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

    .job-type {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #1a237e;
      }
    }

    .progress-bar {
      width: 100px;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      position: relative;
      overflow: hidden;

      .progress-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background: #1a237e;
        border-radius: 10px;
        transition: width 0.3s;
      }

      span {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 11px;
        font-weight: 600;
        color: white;
        mix-blend-mode: difference;
      }
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #757575;

      &:hover {
        background: #f5f5f5;
        color: #1a237e;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #bdbdbd;
      }

      p {
        margin-top: 12px;
        color: #757575;
      }
    }
  `]
})
export class GeneratorDashboardComponent implements OnInit {
  private generatorService = inject(GeneratorService);

  stats = {
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0
  };

  recentJobs: GenerationJob[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Mock data
    this.stats = {
      totalJobs: 156,
      runningJobs: 2,
      completedJobs: 148,
      failedJobs: 6
    };

    this.recentJobs = [
      {
        id: '1', type: 'PROCEDURE', tenantId: '1', tenantName: 'GUCE Cameroun',
        status: 'RUNNING', progress: 65, createdAt: new Date(), startedAt: new Date()
      },
      {
        id: '2', type: 'ENTITY', tenantId: '1', tenantName: 'GUCE Cameroun',
        status: 'COMPLETED', progress: 100, createdAt: new Date(Date.now() - 3600000),
        startedAt: new Date(), completedAt: new Date()
      },
      {
        id: '3', type: 'FRONTEND', tenantId: '2', tenantName: 'GUCE Tchad',
        status: 'COMPLETED', progress: 100, createdAt: new Date(Date.now() - 7200000),
        startedAt: new Date(), completedAt: new Date()
      },
      {
        id: '4', type: 'INFRASTRUCTURE', tenantId: '3', tenantName: 'GUCE RCA',
        status: 'FAILED', progress: 45, createdAt: new Date(Date.now() - 86400000),
        error: 'Terraform apply failed'
      }
    ];
  }

  getJobIcon(type: string): string {
    const icons: Record<string, string> = {
      'PROCEDURE': 'account_tree',
      'ENTITY': 'storage',
      'FRONTEND': 'web',
      'INFRASTRUCTURE': 'cloud'
    };
    return icons[type] || 'code';
  }

  getJobTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'PROCEDURE': 'Procedure',
      'ENTITY': 'Entite',
      'FRONTEND': 'Frontend',
      'INFRASTRUCTURE': 'Infrastructure'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'RUNNING': 'En cours',
      'COMPLETED': 'Termine',
      'FAILED': 'Echoue'
    };
    return labels[status] || status;
  }

  viewJob(job: GenerationJob): void {
    console.log('View job', job);
  }

  downloadOutput(job: GenerationJob): void {
    this.generatorService.downloadOutput(job.id).subscribe();
  }

  retryJob(job: GenerationJob): void {
    this.generatorService.retryJob(job.id).subscribe(() => this.loadData());
  }
}
