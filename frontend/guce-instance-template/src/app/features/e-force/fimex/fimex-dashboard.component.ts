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
import { FimexService } from '../../../core/services/fimex.service';
import {
  InscriptionFIMEX,
  StatutFIMEX,
  getStatutLabel,
  getTypeInscriptionLabel,
  isStatutActif
} from '../../../core/models/fimex.model';

/**
 * Dashboard FIMEX - Vue d'ensemble des inscriptions de l'opérateur
 *
 * Fonctionnalités:
 * - Affichage de l'inscription active
 * - Alertes de renouvellement
 * - Historique des inscriptions
 * - Actions rapides
 */
@Component({
  selector: 'guce-fimex-dashboard',
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
    <div class="fimex-dashboard">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>FIMEX - Fichier des Importateurs et Exportateurs</h1>
          <p>Gérez votre inscription au fichier des opérateurs du commerce extérieur</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" (click)="nouvelleInscription()" *ngIf="!hasActiveInscription">
            <mat-icon>add</mat-icon>
            Nouvelle inscription
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement de vos inscriptions...</p>
      </div>

      <!-- Content -->
      <div class="dashboard-content" *ngIf="!loading">
        <!-- No Inscription -->
        <mat-card class="empty-state" *ngIf="!inscriptions.length">
          <mat-card-content>
            <mat-icon class="empty-icon">description</mat-icon>
            <h2>Aucune inscription FIMEX</h2>
            <p>Vous n'avez pas encore d'inscription au Fichier des Importateurs et Exportateurs.</p>
            <p>L'inscription FIMEX est obligatoire pour effectuer des opérations d'importation ou d'exportation au Cameroun.</p>
            <button mat-flat-button color="primary" (click)="nouvelleInscription()">
              <mat-icon>add</mat-icon>
              Démarrer mon inscription
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Active Inscription Card -->
        <mat-card class="inscription-active-card" *ngIf="inscriptionActive">
          <div class="card-status-badge" [class]="getStatusClass(inscriptionActive.statut)">
            {{ getStatutLabel(inscriptionActive.statut) }}
          </div>

          <mat-card-header>
            <mat-icon mat-card-avatar class="fimex-avatar">verified_user</mat-icon>
            <mat-card-title>{{ inscriptionActive.entreprise.raisonSociale }}</mat-card-title>
            <mat-card-subtitle>
              <span class="fimex-number">{{ inscriptionActive.numeroFIMEX }}</span>
              <mat-chip class="type-chip">{{ getTypeLabel(inscriptionActive.typeInscription) }}</mat-chip>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- Alert Banner -->
            <div class="alert-banner warning" *ngIf="joursAvantExpiration <= 60 && joursAvantExpiration > 0">
              <mat-icon>warning</mat-icon>
              <span>
                Votre inscription expire dans <strong>{{ joursAvantExpiration }} jours</strong>
                (le {{ inscriptionActive.dateExpiration | date:'dd/MM/yyyy' }}).
                <a (click)="renouveler()">Renouveler maintenant</a>
              </span>
            </div>

            <div class="alert-banner danger" *ngIf="joursAvantExpiration <= 0">
              <mat-icon>error</mat-icon>
              <span>
                Votre inscription FIMEX est <strong>expirée</strong> depuis le {{ inscriptionActive.dateExpiration | date:'dd/MM/yyyy' }}.
                <a (click)="renouveler()">Renouveler immédiatement</a>
              </span>
            </div>

            <div class="alert-banner info" *ngIf="inscriptionActive.statut === 'EN_ATTENTE_PAIEMENT'">
              <mat-icon>payment</mat-icon>
              <span>
                Paiement en attente. Montant: <strong>{{ inscriptionActive.montantAPayer | number }} FCFA</strong>
                <a (click)="effectuerPaiement()">Payer maintenant</a>
              </span>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
              <div class="info-item">
                <span class="label">NINEA</span>
                <span class="value">{{ inscriptionActive.entreprise.ninea }}</span>
              </div>
              <div class="info-item">
                <span class="label">Registre Commerce</span>
                <span class="value">{{ inscriptionActive.entreprise.numeroRegistreCommerce }}</span>
              </div>
              <div class="info-item">
                <span class="label">Date d'inscription</span>
                <span class="value">{{ inscriptionActive.dateInscription | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Date d'expiration</span>
                <span class="value" [class.expired]="joursAvantExpiration <= 0">
                  {{ inscriptionActive.dateExpiration | date:'dd/MM/yyyy' }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Représentant légal</span>
                <span class="value">
                  {{ inscriptionActive.representantLegal.civilite }}
                  {{ inscriptionActive.representantLegal.prenom }}
                  {{ inscriptionActive.representantLegal.nom }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Téléphone</span>
                <span class="value">{{ inscriptionActive.siege.telephone }}</span>
              </div>
            </div>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-actions>
            <button mat-button (click)="voirDetail(inscriptionActive.numeroFIMEX)">
              <mat-icon>visibility</mat-icon>
              Voir détail
            </button>
            <button mat-button (click)="telechargerCertificat()" *ngIf="inscriptionActive.statut === 'ACTIF'">
              <mat-icon>download</mat-icon>
              Télécharger certificat
            </button>
            <button mat-button (click)="amender()" *ngIf="inscriptionActive.statut === 'ACTIF'">
              <mat-icon>edit</mat-icon>
              Modifier
            </button>
            <button mat-flat-button color="accent" (click)="renouveler()"
                    *ngIf="joursAvantExpiration <= 60 && inscriptionActive.statut === 'ACTIF'">
              <mat-icon>refresh</mat-icon>
              Renouveler
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Statistics Cards -->
        <div class="stats-grid" *ngIf="inscriptions.length">
          <mat-card class="stat-card">
            <mat-icon>description</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ inscriptions.length }}</span>
              <span class="stat-label">Inscriptions totales</span>
            </div>
          </mat-card>

          <mat-card class="stat-card" [class.success]="hasActiveInscription">
            <mat-icon>{{ hasActiveInscription ? 'check_circle' : 'cancel' }}</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ hasActiveInscription ? 'Actif' : 'Inactif' }}</span>
              <span class="stat-label">Statut actuel</span>
            </div>
          </mat-card>

          <mat-card class="stat-card" [class.warning]="joursAvantExpiration <= 60">
            <mat-icon>event</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ joursAvantExpiration > 0 ? joursAvantExpiration : 0 }}</span>
              <span class="stat-label">Jours avant expiration</span>
            </div>
          </mat-card>
        </div>

        <!-- Documents Status -->
        <mat-card class="documents-card" *ngIf="inscriptionActive">
          <mat-card-header>
            <mat-card-title>Documents justificatifs</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="documents-list">
              <div class="document-item" *ngFor="let doc of inscriptionActive.piecesJointes">
                <mat-icon [class]="getDocumentStatusClass(doc.statut)">
                  {{ getDocumentStatusIcon(doc.statut) }}
                </mat-icon>
                <div class="document-info">
                  <span class="doc-name">{{ doc.nom }}</span>
                  <span class="doc-date">{{ doc.dateUpload | date:'dd/MM/yyyy' }}</span>
                </div>
                <mat-chip [class]="'status-' + doc.statut.toLowerCase()">
                  {{ getDocumentStatusLabel(doc.statut) }}
                </mat-chip>
              </div>
              <div class="no-documents" *ngIf="!inscriptionActive.piecesJointes?.length">
                <mat-icon>folder_open</mat-icon>
                <span>Aucun document téléchargé</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- History -->
        <mat-card class="history-card" *ngIf="inscriptions.length > 1">
          <mat-card-header>
            <mat-card-title>Historique des inscriptions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="history-list">
              <div class="history-item" *ngFor="let inscription of inscriptionsHistory"
                   (click)="voirDetail(inscription.numeroFIMEX)">
                <div class="history-icon">
                  <mat-icon>history</mat-icon>
                </div>
                <div class="history-content">
                  <span class="history-number">{{ inscription.numeroFIMEX }}</span>
                  <span class="history-dates">
                    {{ inscription.dateInscription | date:'dd/MM/yyyy' }} -
                    {{ inscription.dateExpiration | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <mat-chip [class]="'status-' + inscription.statut.toLowerCase()">
                  {{ getStatutLabel(inscription.statut) }}
                </mat-chip>
              </div>
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
              <button mat-stroked-button (click)="validerFimex()">
                <mat-icon>verified</mat-icon>
                Valider un FIMEX
              </button>
              <button mat-stroked-button (click)="contacterSupport()">
                <mat-icon>support_agent</mat-icon>
                Contacter le support
              </button>
              <button mat-stroked-button (click)="voirReglementations()">
                <mat-icon>gavel</mat-icon>
                Réglementations
              </button>
              <button mat-stroked-button (click)="faq()">
                <mat-icon>help</mat-icon>
                FAQ FIMEX
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .fimex-dashboard {
      padding: 24px;
      max-width: 1200px;
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
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 48px;

      .empty-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #ccc;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
        color: #333;
      }

      p {
        color: #666;
        margin: 8px 0;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }

      button {
        margin-top: 24px;
      }
    }

    .inscription-active-card {
      position: relative;
      margin-bottom: 24px;

      .card-status-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;

        &.status-actif {
          background: #E8F5E9;
          color: #2E7D32;
        }

        &.status-expire {
          background: #FFEBEE;
          color: #C62828;
        }

        &.status-en-attente-paiement {
          background: #FFF3E0;
          color: #E65100;
        }

        &.status-soumis, &.status-en-verification {
          background: #E3F2FD;
          color: #1565C0;
        }
      }

      .fimex-avatar {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #008751;
      }

      .fimex-number {
        font-family: 'Roboto Mono', monospace;
        font-weight: 600;
        color: #008751;
        margin-right: 12px;
      }

      .type-chip {
        font-size: 11px;
        height: 24px;
        background: #E3F2FD;
        color: #1565C0;
      }
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;

      mat-icon {
        flex-shrink: 0;
      }

      a {
        color: inherit;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        margin-left: 4px;
      }

      &.warning {
        background: #FFF3E0;
        color: #E65100;
      }

      &.danger {
        background: #FFEBEE;
        color: #C62828;
      }

      &.info {
        background: #E3F2FD;
        color: #1565C0;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;

      .info-item {
        display: flex;
        flex-direction: column;

        .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .value {
          font-size: 14px;
          font-weight: 500;
          color: #333;

          &.expired {
            color: #C62828;
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #008751;
        }

        &.success mat-icon {
          color: #2E7D32;
        }

        &.warning mat-icon {
          color: #E65100;
        }

        .stat-content {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }

          .stat-label {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .documents-card, .history-card, .actions-card {
      margin-bottom: 24px;
    }

    .documents-list {
      .document-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        mat-icon {
          &.status-valide {
            color: #2E7D32;
          }
          &.status-rejete {
            color: #C62828;
          }
          &.status-en-attente {
            color: #E65100;
          }
        }

        .document-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .doc-name {
            font-weight: 500;
          }

          .doc-date {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .no-documents {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #999;
        padding: 16px;
        justify-content: center;
      }
    }

    .history-list {
      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.2s;

        &:hover {
          background: #f5f5f5;
        }

        .history-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            color: #666;
          }
        }

        .history-content {
          flex: 1;
          display: flex;
          flex-direction: column;

          .history-number {
            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
          }

          .history-dates {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

    mat-chip {
      &.status-actif {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-expire {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }

      &.status-valide {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-rejete {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }

      &.status-en_attente {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }
    }

    @media (max-width: 768px) {
      .fimex-dashboard {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class FimexDashboardComponent implements OnInit {
  private fimexService = inject(FimexService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = true;
  inscriptions: InscriptionFIMEX[] = [];
  inscriptionActive?: InscriptionFIMEX;
  joursAvantExpiration = 0;

  get hasActiveInscription(): boolean {
    return !!this.inscriptionActive && isStatutActif(this.inscriptionActive.statut);
  }

  get inscriptionsHistory(): InscriptionFIMEX[] {
    return this.inscriptions.filter(i => i.numeroFIMEX !== this.inscriptionActive?.numeroFIMEX);
  }

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.loading = true;
    this.fimexService.getMyInscriptions().subscribe({
      next: (inscriptions) => {
        this.inscriptions = inscriptions;
        this.inscriptionActive = inscriptions.find(i =>
          [StatutFIMEX.ACTIF, StatutFIMEX.EN_ATTENTE_PAIEMENT, StatutFIMEX.SOUMIS,
           StatutFIMEX.EN_VERIFICATION, StatutFIMEX.BROUILLON].includes(i.statut)
        );

        if (this.inscriptionActive) {
          const expiration = new Date(this.inscriptionActive.dateExpiration);
          const today = new Date();
          this.joursAvantExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Erreur de chargement', 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: StatutFIMEX): string {
    return getStatutLabel(statut);
  }

  getTypeLabel(type: string): string {
    return getTypeInscriptionLabel(type as any);
  }

  getStatusClass(statut: StatutFIMEX): string {
    return 'status-' + statut.toLowerCase().replace(/_/g, '-');
  }

  getDocumentStatusIcon(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'check_circle';
      case 'REJETE': return 'cancel';
      default: return 'hourglass_empty';
    }
  }

  getDocumentStatusClass(statut: string): string {
    return 'status-' + statut.toLowerCase();
  }

  getDocumentStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return labels[statut] || statut;
  }

  nouvelleInscription(): void {
    this.router.navigate(['/e-force/fimex/nouvelle-inscription']);
  }

  voirDetail(numeroFIMEX: string): void {
    this.router.navigate(['/e-force/fimex/inscription', numeroFIMEX]);
  }

  renouveler(): void {
    if (this.inscriptionActive) {
      this.router.navigate(['/e-force/fimex/renouvellement', this.inscriptionActive.numeroFIMEX]);
    }
  }

  amender(): void {
    if (this.inscriptionActive) {
      this.router.navigate(['/e-force/fimex/amendement', this.inscriptionActive.numeroFIMEX]);
    }
  }

  effectuerPaiement(): void {
    if (this.inscriptionActive) {
      this.fimexService.initiatePayment(this.inscriptionActive.numeroFIMEX).subscribe({
        next: (response) => {
          window.location.href = response.paymentUrl;
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Erreur lors de l\'initiation du paiement', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  telechargerCertificat(): void {
    if (this.inscriptionActive) {
      this.fimexService.downloadCertificat(this.inscriptionActive.numeroFIMEX).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificat-fimex-${this.inscriptionActive!.numeroFIMEX}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Erreur lors du téléchargement', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  validerFimex(): void {
    // TODO: Implement FIMEX validation dialog
    this.snackBar.open('Fonctionnalité à venir', 'OK', { duration: 3000 });
  }

  contacterSupport(): void {
    window.open('mailto:support@eguce.cm?subject=Support FIMEX', '_blank');
  }

  voirReglementations(): void {
    window.open('https://docs.eguce.cm/fimex/reglementations', '_blank');
  }

  faq(): void {
    window.open('https://docs.eguce.cm/fimex/faq', '_blank');
  }
}
