import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'guce-egov-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="egov-dashboard">
      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card inbox" routerLink="/e-gov/inbox">
          <div class="stat-icon"><mat-icon>inbox</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.inbox }}</span>
            <span class="stat-label">Corbeille d'arrivée</span>
          </div>
        </mat-card>

        <mat-card class="stat-card processing" routerLink="/e-gov/processing">
          <div class="stat-icon"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.processing }}</span>
            <span class="stat-label">En traitement</span>
          </div>
        </mat-card>

        <mat-card class="stat-card today" routerLink="/e-gov/decisions">
          <div class="stat-icon"><mat-icon>task_alt</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayProcessed }}</span>
            <span class="stat-label">Traités aujourd'hui</span>
          </div>
        </mat-card>

        <mat-card class="stat-card delay">
          <div class="stat-icon"><mat-icon>schedule</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.avgDelay }}j</span>
            <span class="stat-label">Délai moyen</span>
          </div>
        </mat-card>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Inbox Preview -->
        <mat-card class="inbox-card">
          <mat-card-header>
            <mat-card-title>Corbeille d'arrivée</mat-card-title>
            <button mat-button color="primary" routerLink="/e-gov/inbox">
              Voir tout <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="dossier-list">
              <div class="dossier-item" *ngFor="let d of inboxItems" [routerLink]="['/e-gov/processing', d.id]">
                <div class="dossier-priority" [class]="d.priority"></div>
                <div class="dossier-info">
                  <span class="dossier-ref">{{ d.reference }}</span>
                  <span class="dossier-type">{{ d.type }}</span>
                </div>
                <div class="dossier-meta">
                  <span class="dossier-operator">{{ d.operator }}</span>
                  <span class="dossier-date">{{ d.date }}</span>
                </div>
                <mat-icon class="arrow">chevron_right</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Quick Stats -->
          <mat-card class="quick-stats-card">
            <mat-card-header>
              <mat-card-title>Performance</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="perf-item">
                <div class="perf-label">
                  <span>Taux d'approbation</span>
                  <span class="perf-value good">{{ performance.approvalRate }}%</span>
                </div>
                <div class="perf-bar">
                  <div class="perf-fill good" [style.width.%]="performance.approvalRate"></div>
                </div>
              </div>
              <div class="perf-item">
                <div class="perf-label">
                  <span>Dans les délais</span>
                  <span class="perf-value" [class.good]="performance.onTimeRate >= 80" [class.warning]="performance.onTimeRate < 80">
                    {{ performance.onTimeRate }}%
                  </span>
                </div>
                <div class="perf-bar">
                  <div class="perf-fill" [class.good]="performance.onTimeRate >= 80" [class.warning]="performance.onTimeRate < 80"
                       [style.width.%]="performance.onTimeRate"></div>
                </div>
              </div>
              <div class="perf-item">
                <div class="perf-label">
                  <span>Taux de rejet</span>
                  <span class="perf-value">{{ performance.rejectionRate }}%</span>
                </div>
                <div class="perf-bar">
                  <div class="perf-fill warning" [style.width.%]="performance.rejectionRate"></div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent Decisions -->
          <mat-card class="decisions-card">
            <mat-card-header>
              <mat-card-title>Dernières décisions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="decision-list">
                <div class="decision-item" *ngFor="let d of recentDecisions">
                  <mat-icon [class]="d.decision">{{ d.decision === 'approved' ? 'check_circle' : 'cancel' }}</mat-icon>
                  <div class="decision-info">
                    <span class="decision-ref">{{ d.reference }}</span>
                    <span class="decision-time">{{ d.time }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .egov-dashboard { padding: 24px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover { transform: translateY(-2px); }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
      }

      &.inbox .stat-icon { background: #1976d2; }
      &.processing .stat-icon { background: #f57c00; }
      &.today .stat-icon { background: #388e3c; }
      &.delay .stat-icon { background: #7b1fa2; }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-value { font-size: 28px; font-weight: 700; }
        .stat-label { font-size: 13px; color: #757575; }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .inbox-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        button mat-icon { font-size: 18px; width: 18px; height: 18px; margin-left: 4px; }
      }

      .dossier-list {
        .dossier-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover { background: #f0f0f0; }

          .dossier-priority {
            width: 4px;
            height: 40px;
            border-radius: 2px;

            &.high { background: #f44336; }
            &.medium { background: #ff9800; }
            &.low { background: #4caf50; }
          }

          .dossier-info {
            flex: 1;

            .dossier-ref { font-weight: 500; display: block; }
            .dossier-type { font-size: 12px; color: #757575; }
          }

          .dossier-meta {
            text-align: right;

            .dossier-operator { display: block; font-size: 13px; }
            .dossier-date { font-size: 11px; color: #9e9e9e; }
          }

          .arrow { color: #9e9e9e; }
        }
      }
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .quick-stats-card {
      .perf-item {
        margin-bottom: 20px;

        &:last-child { margin-bottom: 0; }

        .perf-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;

          .perf-value {
            font-weight: 600;

            &.good { color: #388e3c; }
            &.warning { color: #f57c00; }
          }
        }

        .perf-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;

          .perf-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s;

            &.good { background: #4caf50; }
            &.warning { background: #ff9800; }
          }
        }
      }
    }

    .decisions-card {
      .decision-list {
        .decision-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child { border-bottom: none; }

          mat-icon {
            &.approved { color: #4caf50; }
            &.rejected { color: #f44336; }
          }

          .decision-info {
            .decision-ref { font-weight: 500; display: block; font-size: 14px; }
            .decision-time { font-size: 11px; color: #9e9e9e; }
          }
        }
      }
    }
  `]
})
export class EgovDashboardComponent implements OnInit {
  private keycloak = inject(KeycloakService);

  stats = {
    inbox: 45,
    processing: 23,
    todayProcessed: 18,
    avgDelay: 2.5
  };

  performance = {
    approvalRate: 87,
    onTimeRate: 75,
    rejectionRate: 8
  };

  inboxItems = [
    { id: '1', reference: 'IMP-2024-001234', type: 'Déclaration Import', operator: 'SARL Tech Import', date: 'Il y a 5 min', priority: 'high' },
    { id: '2', reference: 'CERT-2024-005678', type: 'Certificat Origine', operator: 'Agro Export SA', date: 'Il y a 15 min', priority: 'medium' },
    { id: '3', reference: 'IMP-2024-001235', type: 'Déclaration Import', operator: 'Auto Parts SARL', date: 'Il y a 30 min', priority: 'low' },
    { id: '4', reference: 'EXP-2024-009012', type: 'Déclaration Export', operator: 'Cacao Plus', date: 'Il y a 1h', priority: 'medium' }
  ];

  recentDecisions = [
    { reference: 'IMP-2024-001232', decision: 'approved', time: 'Il y a 10 min' },
    { reference: 'EXP-2024-005676', decision: 'approved', time: 'Il y a 25 min' },
    { reference: 'IMP-2024-001231', decision: 'rejected', time: 'Il y a 45 min' },
    { reference: 'CERT-2024-005675', decision: 'approved', time: 'Il y a 1h' }
  ];

  ngOnInit() {}
}
