import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { FimexService } from '../../../core/services/fimex.service';
import {
  InscriptionFIMEX,
  StatutFIMEX,
  EvenementFIMEX,
  getStatutLabel,
  getTypeInscriptionLabel,
  getTypeDocumentLabel,
  isStatutActif
} from '../../../core/models/fimex.model';

/**
 * Composant de détail d'une inscription FIMEX
 * Affiche toutes les informations et permet les actions contextuelles
 */
@Component({
  selector: 'guce-fimex-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatChipsModule, MatDividerModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, MatListModule
  ],
  template: `
    <div class="fimex-detail-container">
      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement de l'inscription...</p>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && inscription">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1>{{ inscription.numeroFIMEX }}</h1>
              <p>{{ inscription.entreprise.raisonSociale }}</p>
            </div>
          </div>
          <div class="header-actions">
            <mat-chip [class]="'status-' + inscription.statut.toLowerCase()">
              {{ getStatutLabel(inscription.statut) }}
            </mat-chip>
          </div>
        </div>

        <!-- Alert Banners -->
        <div class="alert-banner warning" *ngIf="joursAvantExpiration <= 60 && joursAvantExpiration > 0">
          <mat-icon>warning</mat-icon>
          <span>
            Cette inscription expire dans <strong>{{ joursAvantExpiration }} jours</strong>.
            <a (click)="renouveler()">Renouveler maintenant</a>
          </span>
        </div>

        <div class="alert-banner danger" *ngIf="joursAvantExpiration <= 0">
          <mat-icon>error</mat-icon>
          <span>
            Cette inscription est <strong>expirée</strong> depuis le {{ inscription.dateExpiration | date:'dd/MM/yyyy' }}.
          </span>
        </div>

        <!-- Quick Actions -->
        <mat-card class="actions-card">
          <mat-card-content>
            <div class="quick-actions">
              <button mat-flat-button color="primary" (click)="telechargerCertificat()"
                      *ngIf="inscription.statut === 'ACTIF'">
                <mat-icon>download</mat-icon>
                Télécharger certificat
              </button>
              <button mat-stroked-button (click)="renouveler()"
                      *ngIf="joursAvantExpiration <= 60 && inscription.statut === 'ACTIF'">
                <mat-icon>refresh</mat-icon>
                Renouveler
              </button>
              <button mat-stroked-button (click)="amender()"
                      *ngIf="inscription.statut === 'ACTIF'">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-stroked-button color="warn" (click)="effectuerPaiement()"
                      *ngIf="inscription.statut === 'EN_ATTENTE_PAIEMENT'">
                <mat-icon>payment</mat-icon>
                Payer ({{ inscription.montantAPayer | number }} FCFA)
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabs -->
        <mat-tab-group>
          <!-- Tab: Vue d'ensemble -->
          <mat-tab label="Vue d'ensemble">
            <div class="tab-content">
              <div class="cards-grid">
                <!-- Type & Validité -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Type & Validité</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-list">
                      <div class="info-item">
                        <span class="label">Type d'inscription</span>
                        <span class="value">{{ getTypeLabel(inscription.typeInscription) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Date d'inscription</span>
                        <span class="value">{{ inscription.dateInscription | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Date d'expiration</span>
                        <span class="value" [class.expired]="joursAvantExpiration <= 0">
                          {{ inscription.dateExpiration | date:'dd/MM/yyyy' }}
                        </span>
                      </div>
                      <div class="info-item" *ngIf="inscription.dateRenouvellement">
                        <span class="label">Dernier renouvellement</span>
                        <span class="value">{{ inscription.dateRenouvellement | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Paiement -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Paiement</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-list">
                      <div class="info-item">
                        <span class="label">Montant</span>
                        <span class="value">{{ inscription.montantAPayer | number }} FCFA</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Statut</span>
                        <mat-chip [color]="inscription.paye ? 'primary' : 'warn'" highlighted>
                          {{ inscription.paye ? 'Payé' : 'En attente' }}
                        </mat-chip>
                      </div>
                      <div class="info-item" *ngIf="inscription.referencePaiement">
                        <span class="label">Référence</span>
                        <span class="value">{{ inscription.referencePaiement }}</span>
                      </div>
                      <div class="info-item" *ngIf="inscription.datePaiement">
                        <span class="label">Date de paiement</span>
                        <span class="value">{{ inscription.datePaiement | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Entreprise -->
          <mat-tab label="Entreprise">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Informations de l'entreprise</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Raison sociale</span>
                      <span class="value">{{ inscription.entreprise.raisonSociale }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Forme juridique</span>
                      <span class="value">{{ inscription.entreprise.formeJuridique }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">NINEA</span>
                      <span class="value">{{ inscription.entreprise.ninea }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Registre commerce</span>
                      <span class="value">{{ inscription.entreprise.numeroRegistreCommerce }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Capital social</span>
                      <span class="value">{{ inscription.entreprise.capitalSocial | number }} FCFA</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Date de création</span>
                      <span class="value">{{ inscription.entreprise.dateCreation | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <h3>Activités</h3>
                  <div class="chips-container">
                    <mat-chip *ngFor="let secteur of inscription.entreprise.secteurActivite">
                      {{ secteur }}
                    </mat-chip>
                  </div>
                  <p class="activities-text">{{ inscription.entreprise.activitesPrincipales?.join(', ') }}</p>

                  <mat-divider></mat-divider>

                  <h3>Adresse du siège</h3>
                  <div class="info-grid">
                    <div class="info-item full-width">
                      <span class="label">Adresse</span>
                      <span class="value">{{ inscription.siege.adresseComplete }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Ville</span>
                      <span class="value">{{ inscription.siege.ville }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Région</span>
                      <span class="value">{{ inscription.siege.region }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Téléphone</span>
                      <span class="value">{{ inscription.siege.telephone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email</span>
                      <span class="value">{{ inscription.siege.email }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab: Représentant légal -->
          <mat-tab label="Représentant légal">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Représentant légal</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item full-width">
                      <span class="label">Nom complet</span>
                      <span class="value">
                        {{ inscription.representantLegal.civilite }}
                        {{ inscription.representantLegal.prenom }}
                        {{ inscription.representantLegal.nom }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="label">Fonction</span>
                      <span class="value">{{ inscription.representantLegal.fonction }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Nationalité</span>
                      <span class="value">{{ inscription.representantLegal.nationalite }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">N° CNI</span>
                      <span class="value">{{ inscription.representantLegal.numeroCNI }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Date de naissance</span>
                      <span class="value">{{ inscription.representantLegal.dateNaissance | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Lieu de naissance</span>
                      <span class="value">{{ inscription.representantLegal.lieuNaissance }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Téléphone</span>
                      <span class="value">{{ inscription.representantLegal.telephone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email</span>
                      <span class="value">{{ inscription.representantLegal.email }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab: Documents -->
          <mat-tab label="Documents">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Documents justificatifs</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-list>
                    <mat-list-item *ngFor="let doc of inscription.piecesJointes">
                      <mat-icon matListItemIcon [class]="'status-' + doc.statut.toLowerCase()">
                        {{ getDocStatusIcon(doc.statut) }}
                      </mat-icon>
                      <div matListItemTitle>{{ getDocumentLabel(doc.type) }}</div>
                      <div matListItemLine>
                        {{ doc.nom }} - {{ doc.dateUpload | date:'dd/MM/yyyy' }}
                      </div>
                      <div matListItemMeta>
                        <mat-chip [class]="'status-chip-' + doc.statut.toLowerCase()">
                          {{ getDocStatusLabel(doc.statut) }}
                        </mat-chip>
                        <button mat-icon-button (click)="telechargerDocument(doc.id)" matTooltip="Télécharger">
                          <mat-icon>download</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>

                  <div class="no-data" *ngIf="!inscription.piecesJointes?.length">
                    <mat-icon>folder_open</mat-icon>
                    <p>Aucun document</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab: Historique -->
          <mat-tab label="Historique">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Historique de traitement</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline" *ngIf="historique.length">
                    <div class="timeline-item" *ngFor="let event of historique">
                      <div class="timeline-marker">
                        <mat-icon>{{ getEventIcon(event.typeEvenement) }}</mat-icon>
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <strong>{{ event.typeEvenement }}</strong>
                          <span class="timeline-date">{{ event.dateEvenement | date:'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <p>{{ event.description }}</p>
                        <span class="timeline-user" *ngIf="event.utilisateur">
                          Par: {{ event.utilisateur }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="no-data" *ngIf="!historique.length">
                    <mat-icon>history</mat-icon>
                    <p>Aucun historique</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </ng-container>
    </div>
  `,
  styles: [`
    .fimex-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #666;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h1 {
          margin: 0;
          font-family: 'Roboto Mono', monospace;
          color: #008751;
        }

        p {
          margin: 4px 0 0;
          color: #666;
        }
      }
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;

      a {
        cursor: pointer;
        font-weight: 600;
        text-decoration: underline;
      }

      &.warning {
        background: #FFF3E0;
        color: #E65100;
      }

      &.danger {
        background: #FFEBEE;
        color: #C62828;
      }
    }

    .actions-card {
      margin-bottom: 24px;

      .quick-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
        }

        .value {
          font-weight: 500;

          &.expired {
            color: #C62828;
          }
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;

      .info-item {
        display: flex;
        flex-direction: column;

        &.full-width {
          grid-column: 1 / -1;
        }

        .label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .value {
          font-weight: 500;
          color: #333;
        }
      }
    }

    h3 {
      margin: 24px 0 16px;
      color: #008751;
      font-size: 16px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .activities-text {
      color: #666;
      font-size: 14px;
    }

    mat-list-item {
      .status-valide { color: #2E7D32; }
      .status-rejete { color: #C62828; }
      .status-en_attente { color: #E65100; }
    }

    .status-chip-valide {
      background: #E8F5E9 !important;
      color: #2E7D32 !important;
    }

    .status-chip-rejete {
      background: #FFEBEE !important;
      color: #C62828 !important;
    }

    .status-chip-en_attente {
      background: #FFF3E0 !important;
      color: #E65100 !important;
    }

    .timeline {
      position: relative;
      padding-left: 40px;

      &::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e0e0e0;
      }

      .timeline-item {
        position: relative;
        padding-bottom: 24px;

        &:last-child {
          padding-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -40px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0e0e0;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #666;
          }
        }

        .timeline-content {
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .timeline-date {
              font-size: 12px;
              color: #999;
            }
          }

          p {
            margin: 0 0 4px;
            color: #666;
          }

          .timeline-user {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #999;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
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

      &.status-en_attente_paiement {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }
    }
  `]
})
export class FimexDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fimexService = inject(FimexService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  inscription?: InscriptionFIMEX;
  historique: EvenementFIMEX[] = [];
  joursAvantExpiration = 0;

  ngOnInit(): void {
    const numeroFIMEX = this.route.snapshot.paramMap.get('numeroFIMEX');
    if (numeroFIMEX) {
      this.loadInscription(numeroFIMEX);
    }
  }

  loadInscription(numeroFIMEX: string): void {
    this.loading = true;
    this.fimexService.getInscriptionByNumero(numeroFIMEX).subscribe({
      next: (inscription) => {
        this.inscription = inscription;
        this.calculateDaysToExpiration();
        this.loadHistorique(numeroFIMEX);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Erreur de chargement', 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadHistorique(numeroFIMEX: string): void {
    this.fimexService.getHistorique(numeroFIMEX).subscribe({
      next: (historique) => this.historique = historique,
      error: () => this.historique = []
    });
  }

  calculateDaysToExpiration(): void {
    if (this.inscription) {
      const expiration = new Date(this.inscription.dateExpiration);
      const today = new Date();
      this.joursAvantExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  getStatutLabel(statut: StatutFIMEX): string {
    return getStatutLabel(statut);
  }

  getTypeLabel(type: string): string {
    return getTypeInscriptionLabel(type as any);
  }

  getDocumentLabel(type: string): string {
    return getTypeDocumentLabel(type as any);
  }

  getDocStatusIcon(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'check_circle';
      case 'REJETE': return 'cancel';
      default: return 'hourglass_empty';
    }
  }

  getDocStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return labels[statut] || statut;
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      'CREATION': 'add_circle',
      'SOUMISSION': 'send',
      'PAIEMENT': 'payment',
      'VERIFICATION': 'fact_check',
      'APPROBATION': 'check_circle',
      'REJET': 'cancel',
      'RENOUVELLEMENT': 'refresh',
      'AMENDEMENT': 'edit'
    };
    return icons[type] || 'info';
  }

  goBack(): void {
    this.router.navigate(['/e-force/fimex']);
  }

  renouveler(): void {
    if (this.inscription) {
      this.router.navigate(['/e-force/fimex/renouvellement', this.inscription.numeroFIMEX]);
    }
  }

  amender(): void {
    if (this.inscription) {
      this.router.navigate(['/e-force/fimex/amendement', this.inscription.numeroFIMEX]);
    }
  }

  effectuerPaiement(): void {
    if (this.inscription) {
      this.fimexService.initiatePayment(this.inscription.numeroFIMEX).subscribe({
        next: (response) => window.location.href = response.paymentUrl,
        error: (error) => this.snackBar.open(error.message, 'Fermer', { duration: 5000 })
      });
    }
  }

  telechargerCertificat(): void {
    if (this.inscription) {
      this.fimexService.downloadCertificat(this.inscription.numeroFIMEX).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificat-fimex-${this.inscription!.numeroFIMEX}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => this.snackBar.open(error.message, 'Fermer', { duration: 5000 })
      });
    }
  }

  telechargerDocument(documentId: string): void {
    if (this.inscription) {
      this.fimexService.downloadDocument(this.inscription.numeroFIMEX, documentId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `document-${documentId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => this.snackBar.open(error.message, 'Fermer', { duration: 5000 })
      });
    }
  }
}
