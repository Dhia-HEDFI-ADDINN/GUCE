import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'guce-processing-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTabsModule,
    MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatDividerModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="processing-detail-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <div class="header-title">
              <h1>{{ dossier.reference }}</h1>
              <mat-chip [class]="'status-' + dossier.status">{{ getStatusLabel(dossier.status) }}</mat-chip>
            </div>
            <p>{{ dossier.type }} - {{ dossier.operator }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="warn" (click)="requestInfo()">
            <mat-icon>help_outline</mat-icon>
            Demander information
          </button>
          <button mat-stroked-button color="warn" (click)="reject()">
            <mat-icon>cancel</mat-icon>
            Rejeter
          </button>
          <button mat-flat-button color="primary" (click)="approve()">
            <mat-icon>check_circle</mat-icon>
            Approuver
          </button>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Main Content -->
        <div class="main-content">
          <mat-tab-group>
            <!-- Summary Tab -->
            <mat-tab label="Résumé">
              <div class="tab-content">
                <mat-card class="summary-card">
                  <h3>Informations déclaration</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Type</span>
                      <span class="value">{{ dossier.type }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Régime</span>
                      <span class="value">{{ dossier.regime }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Valeur CIF</span>
                      <span class="value highlight">{{ formatCurrency(dossier.cifValue) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Poids total</span>
                      <span class="value">{{ dossier.totalWeight }} kg</span>
                    </div>
                  </div>
                </mat-card>

                <mat-card class="operator-card">
                  <h3>Opérateur</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">N° Contribuable</span>
                      <span class="value">{{ dossier.operatorTaxId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Raison sociale</span>
                      <span class="value">{{ dossier.operator }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Historique</span>
                      <span class="value good">{{ dossier.operatorHistory }} dossiers - 95% conformes</span>
                    </div>
                  </div>
                </mat-card>

                <mat-card class="goods-card">
                  <h3>Marchandises ({{ dossier.goods.length }} articles)</h3>
                  <div class="goods-list">
                    <div class="goods-item" *ngFor="let item of dossier.goods; let i = index">
                      <span class="item-num">{{ i + 1 }}</span>
                      <div class="item-info">
                        <span class="item-hs">{{ item.hsCode }}</span>
                        <span class="item-desc">{{ item.description }}</span>
                      </div>
                      <span class="item-value">{{ formatCurrency(item.value) }}</span>
                    </div>
                  </div>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Documents Tab -->
            <mat-tab label="Documents">
              <div class="tab-content">
                <mat-card class="documents-card">
                  <div class="doc-list">
                    <div class="doc-item" *ngFor="let doc of dossier.documents">
                      <div class="doc-icon" [class.verified]="doc.verified">
                        <mat-icon>{{ doc.verified ? 'verified' : 'description' }}</mat-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-name">{{ doc.name }}</span>
                        <span class="doc-status" [class.verified]="doc.verified">
                          {{ doc.verified ? 'Vérifié' : 'À vérifier' }}
                        </span>
                      </div>
                      <div class="doc-actions">
                        <button mat-icon-button (click)="viewDocument(doc)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <mat-checkbox [(ngModel)]="doc.verified" (change)="markVerified(doc)"></mat-checkbox>
                      </div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Verification Tab -->
            <mat-tab label="Vérification">
              <div class="tab-content">
                <mat-card class="verification-card">
                  <h3>Checklist de vérification</h3>
                  <form [formGroup]="verificationForm">
                    <div class="checklist">
                      <mat-checkbox formControlName="documentsComplete">
                        Tous les documents requis sont présents et conformes
                      </mat-checkbox>
                      <mat-checkbox formControlName="valuesCorrect">
                        Les valeurs déclarées sont correctes et cohérentes
                      </mat-checkbox>
                      <mat-checkbox formControlName="hsCodesValid">
                        Les codes SH sont corrects
                      </mat-checkbox>
                      <mat-checkbox formControlName="operatorValid">
                        L'opérateur est en règle
                      </mat-checkbox>
                      <mat-checkbox formControlName="noRestrictions">
                        Pas de restrictions sur les marchandises
                      </mat-checkbox>
                    </div>

                    <mat-divider></mat-divider>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Observations</mat-label>
                      <textarea matInput formControlName="observations" rows="4"
                                placeholder="Notez vos observations..."></textarea>
                    </mat-form-field>
                  </form>
                </mat-card>
              </div>
            </mat-tab>

            <!-- History Tab -->
            <mat-tab label="Historique">
              <div class="tab-content">
                <mat-card class="history-card">
                  <div class="timeline">
                    <div class="timeline-item" *ngFor="let event of dossier.history">
                      <div class="timeline-marker" [class]="event.type"></div>
                      <div class="timeline-content">
                        <span class="event-action">{{ event.action }}</span>
                        <span class="event-date">{{ event.date }}</span>
                        <span class="event-user">Par {{ event.user }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Workflow Status -->
          <mat-card class="workflow-card">
            <h3>Workflow</h3>
            <div class="workflow-steps">
              <div class="step" *ngFor="let step of workflowSteps; let i = index"
                   [class.completed]="step.completed" [class.current]="step.current">
                <div class="step-marker">
                  <mat-icon *ngIf="step.completed">check</mat-icon>
                  <span *ngIf="!step.completed">{{ i + 1 }}</span>
                </div>
                <div class="step-info">
                  <span class="step-name">{{ step.name }}</span>
                  <span class="step-status" *ngIf="step.completedAt">{{ step.completedAt }}</span>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Quick Actions -->
          <mat-card class="actions-card">
            <h3>Actions</h3>
            <div class="action-buttons">
              <button mat-stroked-button (click)="requestInspection()">
                <mat-icon>search</mat-icon>
                Demander inspection
              </button>
              <button mat-stroked-button (click)="addNote()">
                <mat-icon>note_add</mat-icon>
                Ajouter note
              </button>
              <button mat-stroked-button (click)="contactOperator()">
                <mat-icon>mail</mat-icon>
                Contacter opérateur
              </button>
              <button mat-stroked-button (click)="transfer()">
                <mat-icon>swap_horiz</mat-icon>
                Transférer
              </button>
            </div>
          </mat-card>

          <!-- Fees -->
          <mat-card class="fees-card">
            <h3>Frais calculés</h3>
            <div class="fee-item" *ngFor="let fee of dossier.fees">
              <span class="fee-label">{{ fee.label }}</span>
              <span class="fee-amount">{{ formatCurrency(fee.amount) }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="fee-total">
              <span>Total</span>
              <span>{{ formatCurrency(getTotalFees()) }}</span>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .processing-detail-container { padding: 24px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        gap: 16px;

        .header-title {
          display: flex;
          align-items: center;
          gap: 16px;

          h1 { margin: 0; font-size: 24px; }
        }

        p { margin: 8px 0 0; color: #757575; }
      }

      .header-actions { display: flex; gap: 12px; }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;

      @media (max-width: 1200px) { grid-template-columns: 1fr; }
    }

    .tab-content { padding: 24px 0; }

    mat-card {
      margin-bottom: 16px;
      padding: 20px;

      h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .info-item {
        .label { display: block; font-size: 12px; color: #757575; }
        .value { font-weight: 500; &.highlight { color: #1976d2; font-size: 18px; } &.good { color: #388e3c; } }
      }
    }

    .goods-list {
      .goods-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #fafafa;
        border-radius: 8px;
        margin-bottom: 8px;

        .item-num {
          width: 24px;
          height: 24px;
          background: #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .item-info {
          flex: 1;
          .item-hs { display: block; font-size: 12px; color: #1976d2; }
          .item-desc { font-size: 14px; }
        }

        .item-value { font-weight: 600; }
      }
    }

    .doc-list {
      .doc-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        .doc-icon {
          width: 40px;
          height: 40px;
          background: #f5f5f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.verified { background: #e8f5e9; mat-icon { color: #388e3c; } }
        }

        .doc-info {
          flex: 1;
          .doc-name { display: block; font-weight: 500; }
          .doc-status { font-size: 12px; color: #ff9800; &.verified { color: #388e3c; } }
        }
      }
    }

    .checklist {
      mat-checkbox { display: block; margin-bottom: 16px; }
    }

    .timeline {
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

      .timeline-item {
        position: relative;
        padding-bottom: 20px;

        .timeline-marker {
          position: absolute;
          left: -28px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9e9e9e;

          &.create { background: #1976d2; }
          &.submit { background: #7b1fa2; }
          &.process { background: #f57c00; }
          &.approve { background: #388e3c; }
        }

        .timeline-content {
          .event-action { display: block; font-weight: 500; }
          .event-date { display: block; font-size: 12px; color: #757575; }
          .event-user { font-size: 12px; color: #9e9e9e; }
        }
      }
    }

    .sidebar {
      .workflow-steps {
        .step {
          display: flex;
          gap: 12px;
          padding: 12px 0;

          .step-marker {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          &.completed .step-marker { background: #4caf50; color: white; }
          &.current .step-marker { background: #1976d2; color: white; }

          .step-info {
            flex: 1;
            .step-name { display: block; font-weight: 500; }
            .step-status { font-size: 11px; color: #9e9e9e; }
          }
        }
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;

        button { justify-content: flex-start; }
      }

      .fee-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
      }

      .fee-total {
        display: flex;
        justify-content: space-between;
        padding-top: 12px;
        font-weight: 600;
        font-size: 16px;
      }
    }

    ::ng-deep {
      .status-in_progress { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-pending { background-color: #e3f2fd !important; color: #1565c0 !important; }
    }
  `]
})
export class ProcessingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  dossierId = '';
  verificationForm!: FormGroup;

  dossier = {
    id: '1',
    reference: 'IMP-2024-001234',
    type: 'Déclaration Import',
    status: 'in_progress',
    regime: 'IM4 - Mise à la consommation',
    operator: 'SARL Tech Import',
    operatorTaxId: 'M123456789A',
    operatorHistory: 45,
    cifValue: 17500000,
    totalWeight: 350,
    goods: [
      { hsCode: '8471.30.00', description: 'Ordinateurs portables', value: 10000000 },
      { hsCode: '8471.41.00', description: 'Unités de traitement', value: 5000000 },
      { hsCode: '8473.30.00', description: 'Accessoires informatiques', value: 2500000 }
    ],
    documents: [
      { id: '1', name: 'Facture commerciale', verified: true },
      { id: '2', name: 'Connaissement', verified: true },
      { id: '3', name: 'Liste de colisage', verified: false },
      { id: '4', name: 'Certificat de conformité', verified: false }
    ],
    fees: [
      { label: 'Droits de douane (20%)', amount: 3500000 },
      { label: 'TVA (19.25%)', amount: 4043750 },
      { label: 'Précompte (1%)', amount: 175000 },
      { label: 'Redevance douanière', amount: 78750 }
    ],
    history: [
      { type: 'create', action: 'Déclaration créée', date: '10/12/2024 09:30', user: 'Opérateur' },
      { type: 'submit', action: 'Déclaration soumise', date: '10/12/2024 10:15', user: 'Opérateur' },
      { type: 'process', action: 'Prise en charge', date: '10/12/2024 11:00', user: 'Agent Douane' }
    ]
  };

  workflowSteps = [
    { name: 'Soumission', completed: true, completedAt: '10/12/2024', current: false },
    { name: 'Vérification', completed: false, completedAt: null, current: true },
    { name: 'Liquidation', completed: false, completedAt: null, current: false },
    { name: 'Paiement', completed: false, completedAt: null, current: false },
    { name: 'Mainlevée', completed: false, completedAt: null, current: false }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.dossierId = params['dossierId'];
    });

    this.verificationForm = this.fb.group({
      documentsComplete: [false],
      valuesCorrect: [false],
      hsCodesValid: [false],
      operatorValid: [false],
      noRestrictions: [false],
      observations: ['']
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_progress: 'En traitement',
      pending: 'En attente'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getTotalFees(): number {
    return this.dossier.fees.reduce((sum, f) => sum + f.amount, 0);
  }

  viewDocument(doc: any) {
    console.log('View document', doc);
  }

  markVerified(doc: any) {
    console.log('Mark verified', doc);
  }

  approve() {
    this.snackBar.open('Dossier approuvé', 'Fermer', { duration: 3000 });
    this.router.navigate(['/e-gov/inbox']);
  }

  reject() {
    console.log('Reject');
  }

  requestInfo() {
    console.log('Request info');
  }

  requestInspection() {
    console.log('Request inspection');
  }

  addNote() {
    console.log('Add note');
  }

  contactOperator() {
    console.log('Contact operator');
  }

  transfer() {
    console.log('Transfer');
  }

  goBack() {
    this.router.navigate(['/e-gov/processing']);
  }
}
