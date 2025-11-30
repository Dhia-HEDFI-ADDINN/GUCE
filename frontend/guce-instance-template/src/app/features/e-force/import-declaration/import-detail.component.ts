import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { DeclarationService } from '../../../core/services/declaration.service';
import {
  Declaration,
  DeclarationStatus,
  DeclarationType,
  GoodsItem,
  DocumentRef,
  Fee,
  WorkflowStep,
  PaymentStatus
} from '../../../core/models/declaration.model';

/**
 * Détail d'une Déclaration d'Importation
 *
 * Onglets:
 * - Vue d'ensemble: Informations générales et statut
 * - Marchandises: Liste des articles déclarés
 * - Documents: Documents joints et leur statut
 * - Paiements: Frais et historique de paiements
 * - Historique: Timeline du workflow
 */
@Component({
  selector: 'guce-import-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatListModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  template: `
    <div class="import-detail">
      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement du dossier...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <h2>Dossier introuvable</h2>
        <p>Le dossier demandé n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
        <button mat-flat-button color="primary" (click)="retourListe()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>

      <!-- Content -->
      <ng-container *ngIf="declaration && !loading && !error">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button mat-icon-button (click)="retourListe()" matTooltip="Retour à la liste">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-content">
              <div class="title-row">
                <h1>{{ declaration.reference }}</h1>
                <mat-chip [class]="'status-' + declaration.status.toLowerCase()">
                  {{ getStatusLabel(declaration.status) }}
                </mat-chip>
              </div>
              <p>
                {{ getTypeLabel(declaration.type) }} - Créé le {{ declaration.createdAt | date:'dd/MM/yyyy à HH:mm' }}
              </p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-stroked-button [matMenuTriggerFor]="moreMenu">
              <mat-icon>more_vert</mat-icon>
              Plus d'actions
            </button>
            <mat-menu #moreMenu="matMenu">
              <button mat-menu-item (click)="downloadPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                <span>Télécharger PDF</span>
              </button>
              <button mat-menu-item (click)="printDossier()">
                <mat-icon>print</mat-icon>
                <span>Imprimer</span>
              </button>
              <button mat-menu-item (click)="shareDossier()">
                <mat-icon>share</mat-icon>
                <span>Partager</span>
              </button>
              <mat-divider *ngIf="canDelete()"></mat-divider>
              <button mat-menu-item (click)="deleteDossier()" *ngIf="canDelete()" class="delete-action">
                <mat-icon color="warn">delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>

            <button mat-stroked-button (click)="editDossier()" *ngIf="canEdit()">
              <mat-icon>edit</mat-icon>
              Modifier
            </button>
            <button mat-flat-button color="primary" (click)="submitDossier()" *ngIf="canSubmit()">
              <mat-icon>send</mat-icon>
              Soumettre
            </button>
            <button mat-flat-button color="accent" (click)="payDossier()" *ngIf="canPay()">
              <mat-icon>payment</mat-icon>
              Payer
            </button>
          </div>
        </div>

        <!-- Alerts -->
        <div class="alert warning" *ngIf="declaration.status === 'PENDING_DOCUMENTS'">
          <mat-icon>warning</mat-icon>
          <div class="alert-content">
            <strong>Documents requis</strong>
            <p>Des documents complémentaires sont nécessaires pour poursuivre le traitement de votre dossier.</p>
          </div>
          <button mat-stroked-button (click)="selectTab(2)">Voir les documents</button>
        </div>

        <div class="alert error" *ngIf="declaration.status === 'REJECTED'">
          <mat-icon>error</mat-icon>
          <div class="alert-content">
            <strong>Dossier rejeté</strong>
            <p>Votre dossier a été rejeté. Consultez l'historique pour voir les motifs du rejet.</p>
          </div>
          <button mat-stroked-button (click)="selectTab(4)">Voir l'historique</button>
        </div>

        <div class="alert info" *ngIf="declaration.status === 'PENDING_PAYMENT'">
          <mat-icon>payment</mat-icon>
          <div class="alert-content">
            <strong>Paiement en attente</strong>
            <p>Montant à payer: {{ declaration.totalFees | number:'1.0-0' }} {{ declaration.currency }}</p>
          </div>
          <button mat-flat-button color="primary" (click)="payDossier()">Procéder au paiement</button>
        </div>

        <!-- Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="detail-tabs">
          <!-- Overview Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>info</mat-icon>
              Vue d'ensemble
            </ng-template>

            <div class="tab-content overview-tab">
              <!-- Summary Cards -->
              <div class="summary-grid">
                <mat-card class="summary-card">
                  <div class="summary-icon value">
                    <mat-icon>attach_money</mat-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-value">{{ declaration.totalValue | number:'1.0-0' }}</span>
                    <span class="summary-label">{{ declaration.currency }} - Valeur totale</span>
                  </div>
                </mat-card>

                <mat-card class="summary-card">
                  <div class="summary-icon items">
                    <mat-icon>inventory_2</mat-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-value">{{ declaration.goods?.length || 0 }}</span>
                    <span class="summary-label">Article(s)</span>
                  </div>
                </mat-card>

                <mat-card class="summary-card">
                  <div class="summary-icon docs">
                    <mat-icon>description</mat-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-value">{{ declaration.documents?.length || 0 }}</span>
                    <span class="summary-label">Document(s)</span>
                  </div>
                </mat-card>

                <mat-card class="summary-card">
                  <div class="summary-icon fees">
                    <mat-icon>receipt</mat-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-value">{{ declaration.totalFees | number:'1.0-0' }}</span>
                    <span class="summary-label">{{ declaration.currency }} - Frais</span>
                  </div>
                </mat-card>
              </div>

              <!-- Parties Information -->
              <div class="info-grid">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>business</mat-icon>
                    <mat-card-title>Déclarant</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-row">
                      <span class="label">Nom</span>
                      <span class="value">{{ declaration.declarant?.name || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">N° Fiscal</span>
                      <span class="value mono">{{ declaration.declarant?.taxId || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Adresse</span>
                      <span class="value">{{ declaration.declarant?.address || '-' }}</span>
                    </div>
                    <div class="info-row" *ngIf="declaration.declarant?.contact">
                      <span class="label">Contact</span>
                      <span class="value">
                        {{ declaration.declarant.contact.name }}<br>
                        {{ declaration.declarant.contact.email }}<br>
                        {{ declaration.declarant.contact.phone }}
                      </span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>store</mat-icon>
                    <mat-card-title>{{ declaration.type === 'EXPORT' ? 'Exportateur' : 'Importateur' }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-row">
                      <span class="label">Nom</span>
                      <span class="value">{{ declaration.importerExporter?.name || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">N° Fiscal</span>
                      <span class="value mono">{{ declaration.importerExporter?.taxId || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Pays</span>
                      <span class="value">{{ declaration.importerExporter?.country || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Adresse</span>
                      <span class="value">{{ declaration.importerExporter?.address || '-' }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Declaration Details -->
              <mat-card class="details-card">
                <mat-card-header>
                  <mat-card-title>Détails de la déclaration</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="details-grid">
                    <div class="detail-item">
                      <span class="label">Type</span>
                      <span class="value">{{ getTypeLabel(declaration.type) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Régime</span>
                      <span class="value">{{ declaration.regime || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Étape actuelle</span>
                      <span class="value">{{ declaration.currentStep || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Statut paiement</span>
                      <mat-chip [class]="'payment-' + declaration.paymentStatus?.toLowerCase()">
                        {{ getPaymentStatusLabel(declaration.paymentStatus) }}
                      </mat-chip>
                    </div>
                    <div class="detail-item">
                      <span class="label">Date création</span>
                      <span class="value">{{ declaration.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Dernière mise à jour</span>
                      <span class="value">{{ declaration.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="detail-item" *ngIf="declaration.submittedAt">
                      <span class="label">Date soumission</span>
                      <span class="value">{{ declaration.submittedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="detail-item" *ngIf="declaration.validatedAt">
                      <span class="label">Date validation</span>
                      <span class="value">{{ declaration.validatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Goods Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>inventory_2</mat-icon>
              Marchandises
              <span class="tab-badge" *ngIf="declaration.goods?.length">{{ declaration.goods.length }}</span>
            </ng-template>

            <div class="tab-content goods-tab">
              <div class="tab-header">
                <h2>Articles déclarés</h2>
                <button mat-stroked-button (click)="exportGoods()" *ngIf="declaration.goods?.length">
                  <mat-icon>download</mat-icon>
                  Exporter
                </button>
              </div>

              <table mat-table [dataSource]="declaration.goods || []" class="goods-table" *ngIf="declaration.goods?.length">
                <ng-container matColumnDef="lineNumber">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let item">{{ item.lineNumber }}</td>
                </ng-container>

                <ng-container matColumnDef="hsCode">
                  <th mat-header-cell *matHeaderCellDef>Code SH</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="mono">{{ item.hsCode }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let item">{{ item.description }}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantité</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }} {{ item.unit }}</td>
                </ng-container>

                <ng-container matColumnDef="weight">
                  <th mat-header-cell *matHeaderCellDef>Poids (kg)</th>
                  <td mat-cell *matCellDef="let item">{{ item.weight | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Valeur</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.value | number:'1.0-0' }} {{ declaration.currency }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="origin">
                  <th mat-header-cell *matHeaderCellDef>Origine</th>
                  <td mat-cell *matCellDef="let item">{{ item.origin }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="goodsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: goodsColumns;"></tr>
              </table>

              <div class="goods-summary" *ngIf="declaration.goods?.length">
                <div class="summary-item">
                  <span class="label">Total articles:</span>
                  <span class="value">{{ declaration.goods.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Poids total:</span>
                  <span class="value">{{ getTotalWeight() | number:'1.2-2' }} kg</span>
                </div>
                <div class="summary-item">
                  <span class="label">Valeur totale:</span>
                  <span class="value">{{ declaration.totalValue | number:'1.0-0' }} {{ declaration.currency }}</span>
                </div>
              </div>

              <div class="empty-state" *ngIf="!declaration.goods?.length">
                <mat-icon>inventory</mat-icon>
                <p>Aucune marchandise déclarée</p>
              </div>
            </div>
          </mat-tab>

          <!-- Documents Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>folder</mat-icon>
              Documents
              <span class="tab-badge" *ngIf="declaration.documents?.length">{{ declaration.documents.length }}</span>
            </ng-template>

            <div class="tab-content documents-tab">
              <div class="tab-header">
                <h2>Documents joints</h2>
                <button mat-flat-button color="primary" (click)="uploadDocument()" *ngIf="canUploadDocuments()">
                  <mat-icon>upload</mat-icon>
                  Ajouter un document
                </button>
              </div>

              <div class="documents-list" *ngIf="declaration.documents?.length">
                <mat-card class="document-card" *ngFor="let doc of declaration.documents">
                  <div class="document-icon" [class]="'doc-' + getDocExtension(doc.name)">
                    <mat-icon>{{ getDocIcon(doc.name) }}</mat-icon>
                  </div>
                  <div class="document-info">
                    <span class="doc-name">{{ doc.name }}</span>
                    <span class="doc-meta">
                      {{ doc.type }} - Ajouté le {{ doc.uploadedAt | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                  <mat-chip [class]="'doc-status-' + doc.status.toLowerCase()">
                    {{ getDocStatusLabel(doc.status) }}
                  </mat-chip>
                  <div class="document-actions">
                    <button mat-icon-button matTooltip="Télécharger" (click)="downloadDocument(doc)">
                      <mat-icon>download</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Supprimer" (click)="deleteDocument(doc)"
                            *ngIf="canDeleteDocument(doc)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card>
              </div>

              <div class="empty-state" *ngIf="!declaration.documents?.length">
                <mat-icon>folder_open</mat-icon>
                <p>Aucun document joint</p>
                <button mat-stroked-button (click)="uploadDocument()" *ngIf="canUploadDocuments()">
                  <mat-icon>upload</mat-icon>
                  Ajouter un document
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- Payments Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>payment</mat-icon>
              Paiements
            </ng-template>

            <div class="tab-content payments-tab">
              <div class="tab-header">
                <h2>Frais et paiements</h2>
                <mat-chip [class]="'payment-' + declaration.paymentStatus?.toLowerCase()">
                  {{ getPaymentStatusLabel(declaration.paymentStatus) }}
                </mat-chip>
              </div>

              <mat-card class="fees-summary">
                <mat-card-header>
                  <mat-card-title>Récapitulatif des frais</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="fees-list" *ngIf="declaration.fees?.length">
                    <div class="fee-item" *ngFor="let fee of declaration.fees">
                      <div class="fee-info">
                        <span class="fee-type">{{ fee.type }}</span>
                        <span class="fee-desc">{{ fee.description }}</span>
                      </div>
                      <div class="fee-amount">
                        <span class="amount">{{ fee.amount | number:'1.0-0' }} {{ fee.currency }}</span>
                        <mat-chip [class]="'payment-' + fee.status.toLowerCase()" class="fee-status">
                          {{ getPaymentStatusLabel(fee.status) }}
                        </mat-chip>
                      </div>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="fees-total">
                    <span class="label">Total à payer</span>
                    <span class="total-amount">
                      {{ declaration.totalFees | number:'1.0-0' }} {{ declaration.currency }}
                    </span>
                  </div>
                </mat-card-content>
                <mat-card-actions *ngIf="canPay()">
                  <button mat-flat-button color="primary" (click)="payDossier()">
                    <mat-icon>payment</mat-icon>
                    Procéder au paiement
                  </button>
                </mat-card-actions>
              </mat-card>

              <div class="empty-state" *ngIf="!declaration.fees?.length">
                <mat-icon>receipt_long</mat-icon>
                <p>Aucun frais calculé</p>
                <button mat-stroked-button (click)="calculateFees()" *ngIf="canCalculateFees()">
                  <mat-icon>calculate</mat-icon>
                  Calculer les frais
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- History Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>history</mat-icon>
              Historique
            </ng-template>

            <div class="tab-content history-tab">
              <div class="tab-header">
                <h2>Historique du workflow</h2>
              </div>

              <div class="timeline" *ngIf="declaration.workflowHistory?.length">
                <div class="timeline-item" *ngFor="let step of declaration.workflowHistory; let last = last"
                     [class.completed]="step.status === 'COMPLETED'"
                     [class.current]="step.status === 'CURRENT'"
                     [class.pending]="step.status === 'PENDING'">
                  <div class="timeline-marker">
                    <mat-icon *ngIf="step.status === 'COMPLETED'">check_circle</mat-icon>
                    <mat-icon *ngIf="step.status === 'CURRENT'">radio_button_checked</mat-icon>
                    <mat-icon *ngIf="step.status === 'PENDING'">radio_button_unchecked</mat-icon>
                  </div>
                  <div class="timeline-connector" *ngIf="!last"></div>
                  <div class="timeline-content">
                    <div class="step-header">
                      <span class="step-name">{{ step.step }}</span>
                      <span class="step-date" *ngIf="step.timestamp">
                        {{ step.timestamp | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                    <div class="step-details" *ngIf="step.actor || step.action">
                      <span class="step-actor" *ngIf="step.actor">{{ step.actor }}</span>
                      <span class="step-action" *ngIf="step.action">{{ step.action }}</span>
                    </div>
                    <div class="step-comment" *ngIf="step.comment">
                      <mat-icon>comment</mat-icon>
                      {{ step.comment }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="empty-state" *ngIf="!declaration.workflowHistory?.length">
                <mat-icon>timeline</mat-icon>
                <p>Aucun historique disponible</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </ng-container>
    </div>
  `,
  styles: [`
    .import-detail {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
        color: #333;
      }

      p {
        color: #666;
        margin: 0 0 24px;
      }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .header-content {
        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;

          h1 {
            margin: 0;
            font-family: 'Roboto Mono', monospace;
            font-size: 24px;
            color: #008751;
          }
        }

        p {
          margin: 4px 0 0;
          color: #666;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .alert-content {
        flex: 1;

        strong {
          display: block;
          margin-bottom: 4px;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }

      &.warning {
        background: #FFF3E0;
        border-left: 4px solid #E65100;

        mat-icon {
          color: #E65100;
        }
      }

      &.error {
        background: #FFEBEE;
        border-left: 4px solid #C62828;

        mat-icon {
          color: #C62828;
        }
      }

      &.info {
        background: #E3F2FD;
        border-left: 4px solid #1565C0;

        mat-icon {
          color: #1565C0;
        }
      }
    }

    .detail-tabs {
      mat-icon {
        margin-right: 8px;
      }

      .tab-badge {
        background: #008751;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 11px;
        margin-left: 8px;
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        margin: 0;
        color: #333;
        font-size: 20px;
      }
    }

    /* Overview Tab */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .summary-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;

        .summary-icon {
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

          &.value { background: #008751; }
          &.items { background: #1565C0; }
          &.docs { background: #E65100; }
          &.fees { background: #7B1FA2; }
        }

        .summary-content {
          display: flex;
          flex-direction: column;

          .summary-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }

          .summary-label {
            font-size: 13px;
            color: #666;
          }
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .info-card {
        mat-card-header mat-icon {
          color: #008751;
        }

        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .label {
            width: 120px;
            color: #666;
            font-size: 13px;
          }

          .value {
            flex: 1;
            color: #333;

            &.mono {
              font-family: 'Roboto Mono', monospace;
            }
          }
        }
      }
    }

    .details-card {
      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .label {
            font-size: 13px;
            color: #666;
          }

          .value {
            font-weight: 500;
            color: #333;
          }
        }
      }
    }

    /* Goods Tab */
    .goods-table {
      width: 100%;
      margin-bottom: 24px;

      .mono {
        font-family: 'Roboto Mono', monospace;
      }
    }

    .goods-summary {
      display: flex;
      gap: 32px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;

      .summary-item {
        display: flex;
        gap: 8px;

        .label {
          color: #666;
        }

        .value {
          font-weight: 600;
          color: #333;
        }
      }
    }

    /* Documents Tab */
    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .document-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;

        .document-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E3F2FD;

          mat-icon {
            color: #1565C0;
          }

          &.doc-pdf {
            background: #FFEBEE;
            mat-icon { color: #C62828; }
          }

          &.doc-xls, &.doc-xlsx {
            background: #E8F5E9;
            mat-icon { color: #2E7D32; }
          }
        }

        .document-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .doc-name {
            font-weight: 500;
          }

          .doc-meta {
            font-size: 12px;
            color: #666;
          }
        }

        .document-actions {
          display: flex;
          gap: 4px;
        }
      }
    }

    /* Payments Tab */
    .fees-summary {
      .fees-list {
        .fee-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .fee-info {
            display: flex;
            flex-direction: column;

            .fee-type {
              font-weight: 500;
            }

            .fee-desc {
              font-size: 13px;
              color: #666;
            }
          }

          .fee-amount {
            display: flex;
            align-items: center;
            gap: 12px;

            .amount {
              font-weight: 500;
              font-family: 'Roboto Mono', monospace;
            }

            .fee-status {
              font-size: 11px;
            }
          }
        }
      }

      .fees-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;

        .label {
          font-weight: 500;
          font-size: 16px;
        }

        .total-amount {
          font-size: 24px;
          font-weight: 600;
          color: #008751;
          font-family: 'Roboto Mono', monospace;
        }
      }
    }

    /* History Tab */
    .timeline {
      position: relative;
      padding-left: 32px;

      .timeline-item {
        position: relative;
        padding-bottom: 24px;

        &:last-child {
          padding-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -32px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          z-index: 1;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }

        .timeline-connector {
          position: absolute;
          left: -20px;
          top: 24px;
          width: 2px;
          height: calc(100% - 24px);
          background: #E0E0E0;
        }

        &.completed {
          .timeline-marker mat-icon { color: #2E7D32; }
          .timeline-connector { background: #2E7D32; }
        }

        &.current {
          .timeline-marker mat-icon { color: #1565C0; }
        }

        &.pending {
          .timeline-marker mat-icon { color: #9E9E9E; }
        }

        .timeline-content {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 16px;

          .step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .step-name {
              font-weight: 500;
              color: #333;
            }

            .step-date {
              font-size: 12px;
              color: #666;
            }
          }

          .step-details {
            font-size: 13px;
            color: #666;

            .step-actor {
              font-weight: 500;
            }
          }

          .step-comment {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #E0E0E0;
            font-size: 13px;
            color: #666;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
              color: #999;
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        margin: 0 0 16px;
      }
    }

    /* Status Chips */
    mat-chip {
      &.status-draft {
        background: #ECEFF1 !important;
        color: #546E7A !important;
      }

      &.status-submitted {
        background: #E3F2FD !important;
        color: #1565C0 !important;
      }

      &.status-pending_payment {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.status-paid, &.status-approved {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-in_process {
        background: #FFF8E1 !important;
        color: #F9A825 !important;
      }

      &.status-pending_documents {
        background: #FCE4EC !important;
        color: #C2185B !important;
      }

      &.status-rejected {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }

      &.status-cancelled {
        background: #F5F5F5 !important;
        color: #9E9E9E !important;
      }

      &.payment-pending {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.payment-partial {
        background: #FFF8E1 !important;
        color: #F9A825 !important;
      }

      &.payment-paid {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.doc-status-pending {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.doc-status-verified {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.doc-status-rejected {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }
    }

    .delete-action {
      color: #C62828;
    }

    @media (max-width: 768px) {
      .import-detail {
        padding: 16px;
      }

      .page-header {
        .header-actions {
          width: 100%;

          button {
            flex: 1;
          }
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ImportDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private declarationService = inject(DeclarationService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  declaration: Declaration | null = null;
  loading = true;
  error = false;
  selectedTabIndex = 0;

  goodsColumns = ['lineNumber', 'hsCode', 'description', 'quantity', 'weight', 'value', 'origin'];

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const reference = params['numeroDossier'];
      if (reference) {
        this.loadDeclaration(reference);
      }
    });

    // Check for action query param
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['action'] === 'pay') {
        this.selectedTabIndex = 3; // Payments tab
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDeclaration(reference: string): void {
    this.loading = true;
    this.error = false;

    this.declarationService.getByReference(reference).subscribe({
      next: (declaration) => {
        this.declaration = declaration;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading declaration:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  selectTab(index: number): void {
    this.selectedTabIndex = index;
  }

  // Status/Type labels
  getStatusLabel(status: DeclarationStatus): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'SUBMITTED': 'Soumis',
      'PENDING_PAYMENT': 'Attente paiement',
      'PAID': 'Payé',
      'IN_PROCESS': 'En cours',
      'PENDING_DOCUMENTS': 'Attente documents',
      'PENDING_INSPECTION': 'Attente inspection',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: DeclarationType): string {
    const labels: Record<string, string> = {
      'IMPORT': 'Importation',
      'EXPORT': 'Exportation',
      'TRANSIT': 'Transit',
      'TEMPORARY': 'Temporaire'
    };
    return labels[type] || type;
  }

  getPaymentStatusLabel(status: PaymentStatus | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PARTIAL': 'Partiel',
      'PAID': 'Payé',
      'REFUNDED': 'Remboursé'
    };
    return labels[status] || status;
  }

  getDocStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'VERIFIED': 'Vérifié',
      'REJECTED': 'Rejeté'
    };
    return labels[status] || status;
  }

  // Document helpers
  getDocIcon(filename: string): string {
    const ext = this.getDocExtension(filename);
    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'xls':
      case 'xlsx': return 'table_chart';
      case 'doc':
      case 'docx': return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      default: return 'insert_drive_file';
    }
  }

  getDocExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  // Calculations
  getTotalWeight(): number {
    if (!this.declaration?.goods) return 0;
    return this.declaration.goods.reduce((sum, item) => sum + (item.weight || 0), 0);
  }

  // Permission checks
  canEdit(): boolean {
    return this.declaration?.status === DeclarationStatus.DRAFT;
  }

  canSubmit(): boolean {
    return this.declaration?.status === DeclarationStatus.DRAFT;
  }

  canPay(): boolean {
    return this.declaration?.status === DeclarationStatus.PENDING_PAYMENT;
  }

  canDelete(): boolean {
    return this.declaration?.status === DeclarationStatus.DRAFT;
  }

  canUploadDocuments(): boolean {
    return [DeclarationStatus.DRAFT, DeclarationStatus.PENDING_DOCUMENTS]
      .includes(this.declaration?.status as DeclarationStatus);
  }

  canDeleteDocument(doc: DocumentRef): boolean {
    return this.canUploadDocuments() && doc.status === 'PENDING';
  }

  canCalculateFees(): boolean {
    return this.declaration?.status === DeclarationStatus.DRAFT && !this.declaration?.fees?.length;
  }

  // Navigation
  retourListe(): void {
    this.router.navigate(['/e-force/import/liste']);
  }

  editDossier(): void {
    if (this.declaration) {
      this.router.navigate(['/e-force/import/dossier', this.declaration.reference, 'edit']);
    }
  }

  // Actions
  submitDossier(): void {
    if (!this.declaration) return;

    if (confirm('Êtes-vous sûr de vouloir soumettre ce dossier ?')) {
      this.declarationService.submit(this.declaration.id).subscribe({
        next: () => {
          this.snackBar.open('Dossier soumis avec succès', 'Fermer', { duration: 3000 });
          this.loadDeclaration(this.declaration!.reference);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la soumission', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  payDossier(): void {
    if (!this.declaration) return;

    // Navigate to payment or show payment dialog
    this.snackBar.open('Redirection vers le paiement...', '', { duration: 2000 });
    // Implement payment initiation
  }

  downloadPDF(): void {
    this.snackBar.open('Téléchargement du PDF en cours...', '', { duration: 2000 });
  }

  printDossier(): void {
    window.print();
  }

  shareDossier(): void {
    if (navigator.share && this.declaration) {
      navigator.share({
        title: `Dossier ${this.declaration.reference}`,
        text: `Déclaration d'importation ${this.declaration.reference}`,
        url: window.location.href
      });
    } else {
      // Copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Lien copié dans le presse-papiers', 'Fermer', { duration: 3000 });
    }
  }

  deleteDossier(): void {
    if (!this.declaration) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
      this.declarationService.delete(this.declaration.id).subscribe({
        next: () => {
          this.snackBar.open('Dossier supprimé', 'Fermer', { duration: 3000 });
          this.retourListe();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  // Document actions
  uploadDocument(): void {
    // Implement file upload dialog
    this.snackBar.open('Upload de document...', '', { duration: 2000 });
  }

  downloadDocument(doc: DocumentRef): void {
    window.open(doc.url, '_blank');
  }

  deleteDocument(doc: DocumentRef): void {
    if (confirm(`Supprimer le document "${doc.name}" ?`)) {
      // Implement document deletion
      this.snackBar.open('Document supprimé', 'Fermer', { duration: 3000 });
    }
  }

  // Fee actions
  calculateFees(): void {
    if (!this.declaration) return;

    this.declarationService.calculateFees(this.declaration.id).subscribe({
      next: () => {
        this.snackBar.open('Frais calculés', 'Fermer', { duration: 3000 });
        this.loadDeclaration(this.declaration!.reference);
      },
      error: () => {
        this.snackBar.open('Erreur lors du calcul des frais', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  exportGoods(): void {
    this.snackBar.open('Export des marchandises en cours...', '', { duration: 2000 });
  }
}
