import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeclarationService } from '../../../core/services/declaration.service';
import { Declaration, DeclarationStatus, DeclarationStats } from '../../../core/models/declaration.model';

/**
 * Dashboard des Déclarations d'Importation
 *
 * Fonctionnalités:
 * - Vue d'ensemble des dossiers en cours
 * - Statistiques par statut
 * - Alertes et notifications
 * - Raccourcis vers actions principales
 */
@Component({
  selector: 'guce-import-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  template: `
    <div class="import-dashboard">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Déclarations d'Importation</h1>
          <p>Gérez vos dossiers d'importation et suivez leur progression</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="voirListe()">
            <mat-icon>list</mat-icon>
            Voir tous les dossiers
          </button>
          <button mat-flat-button color="primary" (click)="nouveauDossier()">
            <mat-icon>add</mat-icon>
            Nouveau dossier
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des données...</p>
      </div>

      <!-- Content -->
      <div class="dashboard-content" *ngIf="!loading">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card" (click)="filterByStatus(null)">
            <div class="stat-icon total">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">Total dossiers</span>
            </div>
          </mat-card>

          <mat-card class="stat-card" (click)="filterByStatus('DRAFT')">
            <div class="stat-icon draft">
              <mat-icon>edit</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.draft }}</span>
              <span class="stat-label">Brouillons</span>
            </div>
          </mat-card>

          <mat-card class="stat-card" (click)="filterByStatus('IN_PROCESS')">
            <div class="stat-icon processing">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.inProcess }}</span>
              <span class="stat-label">En cours</span>
            </div>
          </mat-card>

          <mat-card class="stat-card" (click)="filterByStatus('PENDING_PAYMENT')">
            <div class="stat-icon payment">
              <mat-icon>payment</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.pendingPayment }}</span>
              <span class="stat-label">En attente paiement</span>
            </div>
          </mat-card>

          <mat-card class="stat-card success" (click)="filterByStatus('APPROVED')">
            <div class="stat-icon approved">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.approved }}</span>
              <span class="stat-label">Approuvés</span>
            </div>
          </mat-card>

          <mat-card class="stat-card danger" (click)="filterByStatus('REJECTED')">
            <div class="stat-icon rejected">
              <mat-icon>cancel</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.rejected }}</span>
              <span class="stat-label">Rejetés</span>
            </div>
          </mat-card>
        </div>

        <!-- Alerts Section -->
        <mat-card class="alerts-card" *ngIf="alertDossiers.length > 0">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            <mat-card-title>Actions requises</mat-card-title>
            <mat-card-subtitle>{{ alertDossiers.length }} dossier(s) nécessitent votre attention</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="alert-list">
              <div class="alert-item" *ngFor="let dossier of alertDossiers" (click)="voirDossier(dossier.reference)">
                <mat-icon [class]="getAlertClass(dossier.status)">
                  {{ getAlertIcon(dossier.status) }}
                </mat-icon>
                <div class="alert-content">
                  <span class="alert-reference">{{ dossier.reference }}</span>
                  <span class="alert-message">{{ getAlertMessage(dossier) }}</span>
                </div>
                <mat-icon class="arrow-icon">chevron_right</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Dossiers -->
        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Dossiers récents</mat-card-title>
            <button mat-button color="primary" (click)="voirListe()">Voir tout</button>
          </mat-card-header>
          <mat-card-content>
            <div class="recent-list" *ngIf="recentDossiers.length > 0">
              <div class="recent-item" *ngFor="let dossier of recentDossiers" (click)="voirDossier(dossier.reference)">
                <div class="dossier-info">
                  <span class="dossier-reference">{{ dossier.reference }}</span>
                  <span class="dossier-date">{{ dossier.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="dossier-details">
                  <span class="dossier-value">{{ dossier.totalValue | number }} {{ dossier.currency }}</span>
                  <span class="dossier-items">{{ dossier.goods?.length || 0 }} article(s)</span>
                </div>
                <mat-chip [class]="'status-' + dossier.status.toLowerCase()">
                  {{ getStatusLabel(dossier.status) }}
                </mat-chip>
              </div>
            </div>
            <div class="no-data" *ngIf="recentDossiers.length === 0">
              <mat-icon>inbox</mat-icon>
              <p>Aucun dossier récent</p>
              <button mat-stroked-button (click)="nouveauDossier()">Créer un dossier</button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Actions rapides</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid">
              <button mat-stroked-button (click)="nouveauDossier()">
                <mat-icon>add_circle</mat-icon>
                Nouvelle DI
              </button>
              <button mat-stroked-button (click)="voirListe()">
                <mat-icon>list_alt</mat-icon>
                Liste des DI
              </button>
              <button mat-stroked-button (click)="rechercherDI()">
                <mat-icon>search</mat-icon>
                Rechercher
              </button>
              <button mat-stroked-button (click)="voirPaiements()">
                <mat-icon>payment</mat-icon>
                Paiements
              </button>
              <button mat-stroked-button (click)="voirDocuments()">
                <mat-icon>folder</mat-icon>
                Documents
              </button>
              <button mat-stroked-button (click)="voirAide()">
                <mat-icon>help</mat-icon>
                Aide
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Info Cards -->
        <div class="info-grid">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>info</mat-icon>
              <mat-card-title>Procédure d'importation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ol>
                <li>Vérifiez votre inscription FIMEX</li>
                <li>Créez une déclaration d'importation</li>
                <li>Téléchargez les documents requis</li>
                <li>Effectuez le paiement des frais</li>
                <li>Suivez le traitement de votre dossier</li>
              </ol>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>description</mat-icon>
              <mat-card-title>Documents requis</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul>
                <li>Facture pro-forma ou définitive</li>
                <li>Connaissement (BL)</li>
                <li>Liste de colisage</li>
                <li>Certificat d'origine</li>
                <li>Attestation de conformité fiscale</li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .import-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        color: #008751;
        font-size: 28px;
      }

      p {
        margin: 8px 0 0;
        color: #666;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #666;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            color: white;
            font-size: 24px;
          }

          &.total { background: #008751; }
          &.draft { background: #6C757D; }
          &.processing { background: #FFC107; }
          &.payment { background: #E65100; }
          &.approved { background: #2E7D32; }
          &.rejected { background: #C62828; }
        }

        .stat-content {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #333;
          }

          .stat-label {
            font-size: 13px;
            color: #666;
          }
        }
      }
    }

    .alerts-card {
      margin-bottom: 24px;
      border-left: 4px solid #E65100;

      mat-card-header {
        mat-icon {
          color: #E65100;
        }
      }

      .alert-list {
        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #f5f5f5;
          }

          mat-icon {
            &.warn { color: #E65100; }
            &.error { color: #C62828; }
            &.info { color: #1565C0; }
          }

          .alert-content {
            flex: 1;
            display: flex;
            flex-direction: column;

            .alert-reference {
              font-family: 'Roboto Mono', monospace;
              font-weight: 500;
              color: #008751;
            }

            .alert-message {
              font-size: 13px;
              color: #666;
            }
          }

          .arrow-icon {
            color: #ccc;
          }
        }
      }
    }

    .recent-card {
      margin-bottom: 24px;

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .recent-list {
        .recent-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: #fafafa;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .dossier-info {
            flex: 1;
            display: flex;
            flex-direction: column;

            .dossier-reference {
              font-family: 'Roboto Mono', monospace;
              font-weight: 500;
              color: #008751;
            }

            .dossier-date {
              font-size: 12px;
              color: #999;
            }
          }

          .dossier-details {
            display: flex;
            flex-direction: column;
            text-align: right;

            .dossier-value {
              font-weight: 500;
            }

            .dossier-items {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }

      .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        color: #999;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }
      }
    }

    .actions-card {
      margin-bottom: 24px;

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;

        button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          height: auto;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: #008751;
          }
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;

      .info-card {
        mat-icon {
          color: #008751;
        }

        ol, ul {
          margin: 0;
          padding-left: 20px;
          color: #666;

          li {
            margin-bottom: 8px;
          }
        }
      }
    }

    mat-chip {
      &.status-draft {
        background: #ECEFF1 !important;
        color: #546E7A !important;
      }

      &.status-submitted, &.status-in_process {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.status-pending_payment {
        background: #FCE4EC !important;
        color: #C2185B !important;
      }

      &.status-approved {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-rejected {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }
    }

    @media (max-width: 768px) {
      .import-dashboard {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;

        .header-actions {
          width: 100%;
          flex-direction: column;
        }
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ImportDashboardComponent implements OnInit {
  private router = inject(Router);
  private declarationService = inject(DeclarationService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  stats: DeclarationStats = {
    total: 0,
    draft: 0,
    submitted: 0,
    inProcess: 0,
    approved: 0,
    rejected: 0,
    pendingPayment: 0
  };
  recentDossiers: Declaration[] = [];
  alertDossiers: Declaration[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load stats
    this.declarationService.getStats().subscribe({
      next: (stats) => this.stats = stats,
      error: () => {
        // Use fallback data
        this.stats = { total: 0, draft: 0, submitted: 0, inProcess: 0, approved: 0, rejected: 0, pendingPayment: 0 };
      }
    });

    // Load recent dossiers
    this.declarationService.getAll({ page: 0, size: 5, sort: 'createdAt', direction: 'desc' }).subscribe({
      next: (response) => {
        this.recentDossiers = response.content || [];
        this.alertDossiers = this.recentDossiers.filter(d =>
          [DeclarationStatus.PENDING_DOCUMENTS, DeclarationStatus.PENDING_PAYMENT, DeclarationStatus.REJECTED]
            .includes(d.status)
        );
        this.loading = false;
      },
      error: () => {
        this.recentDossiers = [];
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: DeclarationStatus): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'SUBMITTED': 'Soumis',
      'IN_PROCESS': 'En cours',
      'PENDING_PAYMENT': 'Attente paiement',
      'PENDING_DOCUMENTS': 'Attente documents',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
    };
    return labels[status] || status;
  }

  getAlertIcon(status: DeclarationStatus): string {
    switch (status) {
      case DeclarationStatus.PENDING_PAYMENT: return 'payment';
      case DeclarationStatus.PENDING_DOCUMENTS: return 'description';
      case DeclarationStatus.REJECTED: return 'error';
      default: return 'info';
    }
  }

  getAlertClass(status: DeclarationStatus): string {
    switch (status) {
      case DeclarationStatus.REJECTED: return 'error';
      case DeclarationStatus.PENDING_PAYMENT:
      case DeclarationStatus.PENDING_DOCUMENTS: return 'warn';
      default: return 'info';
    }
  }

  getAlertMessage(dossier: Declaration): string {
    switch (dossier.status) {
      case DeclarationStatus.PENDING_PAYMENT:
        return `Paiement en attente: ${dossier.totalFees} ${dossier.currency}`;
      case DeclarationStatus.PENDING_DOCUMENTS:
        return 'Documents manquants à fournir';
      case DeclarationStatus.REJECTED:
        return 'Dossier rejeté - voir les motifs';
      default:
        return 'Action requise';
    }
  }

  filterByStatus(status: string | null): void {
    if (status) {
      this.router.navigate(['/e-force/import/liste'], { queryParams: { status } });
    } else {
      this.router.navigate(['/e-force/import/liste']);
    }
  }

  nouveauDossier(): void {
    this.router.navigate(['/e-force/import/nouveau']);
  }

  voirListe(): void {
    this.router.navigate(['/e-force/import/liste']);
  }

  voirDossier(reference: string): void {
    this.router.navigate(['/e-force/import/dossier', reference]);
  }

  rechercherDI(): void {
    this.router.navigate(['/e-force/import/liste'], { queryParams: { search: true } });
  }

  voirPaiements(): void {
    this.router.navigate(['/e-force/payments']);
  }

  voirDocuments(): void {
    this.router.navigate(['/e-force/documents']);
  }

  voirAide(): void {
    window.open('https://docs.eguce.cm/import', '_blank');
  }
}
