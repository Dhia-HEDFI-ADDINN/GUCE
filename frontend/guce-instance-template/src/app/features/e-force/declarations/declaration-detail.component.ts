import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'guce-declaration-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTabsModule,
    MatChipsModule, MatTableModule, MatDividerModule, MatMenuModule,
    MatDialogModule, MatStepperModule
  ],
  template: `
    <div class="declaration-detail-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <div class="header-title">
              <h1>{{ declaration.reference }}</h1>
              <mat-chip [class]="'status-' + declaration.status">
                {{ getStatusLabel(declaration.status) }}
              </mat-chip>
            </div>
            <p>{{ declaration.type | titlecase }} - Créée le {{ declaration.createdAt }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button [matMenuTriggerFor]="actionsMenu">
            <mat-icon>more_vert</mat-icon>
            Actions
          </button>
          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item [routerLink]="['/e-force/declarations', declaration.id, 'edit']" *ngIf="canEdit()">
              <mat-icon>edit</mat-icon>
              <span>Modifier</span>
            </button>
            <button mat-menu-item (click)="duplicate()">
              <mat-icon>content_copy</mat-icon>
              <span>Dupliquer</span>
            </button>
            <button mat-menu-item (click)="downloadPdf()">
              <mat-icon>picture_as_pdf</mat-icon>
              <span>Télécharger PDF</span>
            </button>
            <button mat-menu-item (click)="print()">
              <mat-icon>print</mat-icon>
              <span>Imprimer</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="cancel()" *ngIf="canCancel()" class="danger">
              <mat-icon>cancel</mat-icon>
              <span>Annuler</span>
            </button>
          </mat-menu>

          <button mat-flat-button color="primary" *ngIf="showPayButton()" routerLink="/e-payment/checkout/{{ declaration.reference }}">
            <mat-icon>payment</mat-icon>
            Payer
          </button>
        </div>
      </div>

      <!-- Workflow Progress -->
      <mat-card class="workflow-card">
        <mat-stepper [selectedIndex]="currentStep" class="workflow-stepper">
          <mat-step *ngFor="let step of workflowSteps; let i = index" [completed]="step.completed" [editable]="false">
            <ng-template matStepLabel>
              <div class="step-label">
                <span class="step-name">{{ step.name }}</span>
                <span class="step-date" *ngIf="step.completedAt">{{ step.completedAt }}</span>
              </div>
            </ng-template>
          </mat-step>
        </mat-stepper>
      </mat-card>

      <!-- Content Tabs -->
      <mat-tab-group>
        <!-- General Info Tab -->
        <mat-tab label="Informations">
          <div class="tab-content">
            <div class="info-grid">
              <!-- Declaration Info -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Informations générales</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-row">
                    <span class="label">Référence</span>
                    <span class="value">{{ declaration.reference }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Type</span>
                    <span class="value">{{ declaration.type | titlecase }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Régime</span>
                    <span class="value">{{ declaration.regime }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Bureau de douane</span>
                    <span class="value">{{ declaration.customsOffice }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Mode de transport</span>
                    <span class="value">{{ declaration.transportMode }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Importer Info -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>{{ declaration.type === 'import' ? 'Importateur' : 'Exportateur' }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-row">
                    <span class="label">N° Contribuable</span>
                    <span class="value">{{ declaration.importer.taxNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Raison sociale</span>
                    <span class="value">{{ declaration.importer.name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Adresse</span>
                    <span class="value">{{ declaration.importer.address }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Shipper Info -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>{{ declaration.type === 'import' ? 'Expéditeur' : 'Destinataire' }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-row">
                    <span class="label">Nom</span>
                    <span class="value">{{ declaration.shipper.name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Pays</span>
                    <span class="value">{{ declaration.shipper.country }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Adresse</span>
                    <span class="value">{{ declaration.shipper.address }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Values Summary -->
              <mat-card class="info-card values-card">
                <mat-card-header>
                  <mat-card-title>Valeurs</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-row">
                    <span class="label">Valeur FOB</span>
                    <span class="value">{{ formatCurrency(declaration.fobValue, declaration.currency) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Fret</span>
                    <span class="value">{{ formatCurrency(declaration.freight, declaration.currency) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Assurance</span>
                    <span class="value">{{ formatCurrency(declaration.insurance, declaration.currency) }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="info-row total">
                    <span class="label">Valeur CIF</span>
                    <span class="value">{{ formatCurrency(declaration.cifValue, declaration.currency) }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Goods Tab -->
        <mat-tab label="Marchandises ({{ declaration.goods.length }})">
          <div class="tab-content">
            <mat-card>
              <table mat-table [dataSource]="declaration.goods" class="goods-table">
                <ng-container matColumnDef="item">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let item; let i = index">{{ i + 1 }}</td>
                </ng-container>

                <ng-container matColumnDef="hsCode">
                  <th mat-header-cell *matHeaderCellDef>Code SH</th>
                  <td mat-cell *matCellDef="let item">{{ item.hsCode }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let item">{{ item.description }}</td>
                </ng-container>

                <ng-container matColumnDef="origin">
                  <th mat-header-cell *matHeaderCellDef>Origine</th>
                  <td mat-cell *matCellDef="let item">{{ item.originCountry }}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantité</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }} {{ item.unit }}</td>
                </ng-container>

                <ng-container matColumnDef="weight">
                  <th mat-header-cell *matHeaderCellDef>Poids (kg)</th>
                  <td mat-cell *matCellDef="let item">{{ item.grossWeight }}</td>
                </ng-container>

                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Valeur</th>
                  <td mat-cell *matCellDef="let item">{{ formatCurrency(item.fobValue, item.currency) }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="goodsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: goodsColumns;"></tr>
              </table>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Documents Tab -->
        <mat-tab label="Documents ({{ declaration.documents.length }})">
          <div class="tab-content">
            <div class="documents-grid">
              <mat-card class="document-card" *ngFor="let doc of declaration.documents">
                <div class="doc-icon">
                  <mat-icon>{{ getDocIcon(doc.type) }}</mat-icon>
                </div>
                <div class="doc-info">
                  <span class="doc-name">{{ doc.name }}</span>
                  <span class="doc-type">{{ doc.type }}</span>
                </div>
                <div class="doc-actions">
                  <button mat-icon-button (click)="viewDocument(doc)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="downloadDocument(doc)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Fees Tab -->
        <mat-tab label="Frais et taxes">
          <div class="tab-content">
            <mat-card class="fees-card">
              <table mat-table [dataSource]="declaration.fees" class="fees-table">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let fee">{{ fee.code }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let fee">{{ fee.description }}</td>
                </ng-container>

                <ng-container matColumnDef="base">
                  <th mat-header-cell *matHeaderCellDef>Base</th>
                  <td mat-cell *matCellDef="let fee">{{ formatCurrency(fee.base, 'XAF') }}</td>
                </ng-container>

                <ng-container matColumnDef="rate">
                  <th mat-header-cell *matHeaderCellDef>Taux</th>
                  <td mat-cell *matCellDef="let fee">{{ fee.rate }}%</td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Montant</th>
                  <td mat-cell *matCellDef="let fee">{{ formatCurrency(fee.amount, 'XAF') }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let fee">
                    <mat-chip [class]="fee.paid ? 'paid' : 'unpaid'">
                      {{ fee.paid ? 'Payé' : 'À payer' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="feesColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: feesColumns;"></tr>

                <tr class="total-row">
                  <td colspan="4"><strong>TOTAL</strong></td>
                  <td><strong>{{ formatCurrency(getTotalFees(), 'XAF') }}</strong></td>
                  <td></td>
                </tr>
              </table>
            </mat-card>
          </div>
        </mat-tab>

        <!-- History Tab -->
        <mat-tab label="Historique">
          <div class="tab-content">
            <mat-card class="history-card">
              <div class="history-timeline">
                <div class="history-item" *ngFor="let event of declaration.history">
                  <div class="history-marker" [class]="event.type"></div>
                  <div class="history-content">
                    <div class="history-header">
                      <span class="history-action">{{ event.action }}</span>
                      <span class="history-date">{{ event.date }}</span>
                    </div>
                    <p class="history-details">{{ event.details }}</p>
                    <span class="history-user">Par {{ event.user }}</span>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .declaration-detail-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .header-info {
          .header-title {
            display: flex;
            align-items: center;
            gap: 16px;

            h1 {
              margin: 0;
              font-size: 24px;
            }
          }

          p {
            margin: 8px 0 0;
            color: #757575;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;

        .danger {
          color: #c62828;
        }
      }
    }

    .workflow-card {
      margin-bottom: 24px;
      padding: 16px;

      ::ng-deep .mat-horizontal-stepper-header-container {
        pointer-events: none;
      }

      .step-label {
        display: flex;
        flex-direction: column;

        .step-name {
          font-weight: 500;
        }

        .step-date {
          font-size: 11px;
          color: #757575;
        }
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .info-card {
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #757575;
        }

        .value {
          font-weight: 500;
        }

        &.total {
          padding-top: 16px;

          .value {
            font-size: 18px;
            color: #1976d2;
          }
        }
      }
    }

    .goods-table {
      width: 100%;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .document-card {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 16px;

      .doc-icon {
        width: 48px;
        height: 48px;
        background: #e3f2fd;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          color: #1976d2;
        }
      }

      .doc-info {
        flex: 1;

        .doc-name {
          font-weight: 500;
          display: block;
        }

        .doc-type {
          font-size: 12px;
          color: #757575;
        }
      }
    }

    .fees-table {
      width: 100%;

      .total-row {
        background: #f5f5f5;

        td {
          padding: 16px;
        }
      }
    }

    ::ng-deep .paid {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    ::ng-deep .unpaid {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .history-card {
      .history-timeline {
        position: relative;
        padding-left: 32px;

        &::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }
      }

      .history-item {
        position: relative;
        padding-bottom: 24px;

        &:last-child {
          padding-bottom: 0;
        }

        .history-marker {
          position: absolute;
          left: -28px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9e9e9e;

          &.create { background: #1976d2; }
          &.submit { background: #7b1fa2; }
          &.approve { background: #388e3c; }
          &.reject { background: #c62828; }
          &.payment { background: #f57c00; }
        }

        .history-content {
          .history-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;

            .history-action {
              font-weight: 500;
            }

            .history-date {
              font-size: 12px;
              color: #9e9e9e;
            }
          }

          .history-details {
            margin: 0 0 4px;
            color: #616161;
          }

          .history-user {
            font-size: 12px;
            color: #9e9e9e;
          }
        }
      }
    }

    ::ng-deep {
      .status-draft { background-color: #f5f5f5 !important; color: #616161 !important; }
      .status-submitted { background-color: #e3f2fd !important; color: #1565c0 !important; }
      .status-processing { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-approved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .status-rejected { background-color: #ffebee !important; color: #c62828 !important; }
    }
  `]
})
export class DeclarationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  declarationId = '';
  currentStep = 2;

  goodsColumns = ['item', 'hsCode', 'description', 'origin', 'quantity', 'weight', 'value'];
  feesColumns = ['code', 'description', 'base', 'rate', 'amount', 'status'];

  workflowSteps = [
    { name: 'Création', completed: true, completedAt: '10/12/2024 09:30' },
    { name: 'Soumission', completed: true, completedAt: '10/12/2024 10:15' },
    { name: 'Validation Douane', completed: false, completedAt: null },
    { name: 'Paiement', completed: false, completedAt: null },
    { name: 'Liquidation', completed: false, completedAt: null }
  ];

  declaration = {
    id: '1',
    reference: 'IMP-2024-001234',
    type: 'import',
    status: 'processing',
    regime: 'IM4 - Mise à la consommation',
    customsOffice: 'Douala Port',
    transportMode: 'Maritime',
    createdAt: '10/12/2024',
    currency: 'USD',
    fobValue: 15000,
    freight: 2000,
    insurance: 500,
    cifValue: 17500,
    importer: {
      taxNumber: 'M123456789A',
      name: 'SARL Tech Import',
      address: 'BP 1234, Douala, Cameroun'
    },
    shipper: {
      name: 'China Electronics Co.',
      country: 'Chine',
      address: 'Shenzhen, Guangdong, China'
    },
    goods: [
      { hsCode: '8471.30.00', description: 'Ordinateurs portables', originCountry: 'CN', quantity: 100, unit: 'U', grossWeight: 250, fobValue: 10000, currency: 'USD' },
      { hsCode: '8471.41.00', description: 'Unités de traitement', originCountry: 'CN', quantity: 50, unit: 'U', grossWeight: 100, fobValue: 5000, currency: 'USD' }
    ],
    documents: [
      { id: '1', name: 'Facture commerciale', type: 'INVOICE' },
      { id: '2', name: 'Liste de colisage', type: 'PACKING_LIST' },
      { id: '3', name: 'Connaissement', type: 'BL' }
    ],
    fees: [
      { code: 'DD', description: 'Droits de douane', base: 10500000, rate: 20, amount: 2100000, paid: false },
      { code: 'TVA', description: 'TVA Import', base: 12600000, rate: 19.25, amount: 2425500, paid: false },
      { code: 'PC', description: 'Précompte', base: 10500000, rate: 1, amount: 105000, paid: false },
      { code: 'RD', description: 'Redevance douanière', base: 10500000, rate: 0.45, amount: 47250, paid: false }
    ],
    history: [
      { type: 'create', action: 'Déclaration créée', details: 'Création de la déclaration en mode brouillon', user: 'Jean Dupont', date: '10/12/2024 09:30' },
      { type: 'submit', action: 'Déclaration soumise', details: 'Soumission pour traitement par les services douaniers', user: 'Jean Dupont', date: '10/12/2024 10:15' },
      { type: 'processing', action: 'Prise en charge', details: 'Déclaration assignée à l\'agent Pierre Martin', user: 'Système', date: '10/12/2024 11:00' }
    ]
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.declarationId = params['id'];
      this.loadDeclaration();
    });
  }

  loadDeclaration() {
    // Load declaration from API
    console.log('Loading declaration', this.declarationId);
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

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getDocIcon(type: string): string {
    const icons: Record<string, string> = {
      INVOICE: 'receipt',
      PACKING_LIST: 'list_alt',
      BL: 'local_shipping',
      CERTIFICATE: 'verified'
    };
    return icons[type] || 'description';
  }

  getTotalFees(): number {
    return this.declaration.fees.reduce((sum, fee) => sum + fee.amount, 0);
  }

  canEdit(): boolean {
    return ['draft', 'rejected'].includes(this.declaration.status);
  }

  canCancel(): boolean {
    return ['draft', 'submitted'].includes(this.declaration.status);
  }

  showPayButton(): boolean {
    return this.declaration.status === 'processing' && this.declaration.fees.some(f => !f.paid);
  }

  duplicate() {
    console.log('Duplicate declaration');
  }

  downloadPdf() {
    console.log('Download PDF');
  }

  print() {
    window.print();
  }

  cancel() {
    console.log('Cancel declaration');
  }

  viewDocument(doc: any) {
    console.log('View document', doc);
  }

  downloadDocument(doc: any) {
    console.log('Download document', doc);
  }

  goBack() {
    this.router.navigate(['/e-force/declarations', this.declaration.type]);
  }
}
