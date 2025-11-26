import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'guce-procedure-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule,
    MatSnackBarModule, MatProgressBarModule
  ],
  template: `
    <div class="procedure-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>{{ procedure.name }}</h1>
            <p>{{ procedure.code }} - {{ procedure.category }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="saveDraft()" [disabled]="saving">
            <mat-icon>save</mat-icon>
            Enregistrer
          </button>
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving || !canSubmit()">
            <mat-icon>send</mat-icon>
            Soumettre
          </button>
        </div>
      </div>

      <!-- Info Banner -->
      <mat-card class="info-banner">
        <mat-icon>info</mat-icon>
        <div class="info-content">
          <p>{{ procedure.description }}</p>
          <div class="info-meta">
            <span><mat-icon>schedule</mat-icon> Délai estimé: {{ procedure.estimatedTime }}</span>
            <span><mat-icon>payments</mat-icon> Frais: {{ procedure.fees }}</span>
          </div>
        </div>
      </mat-card>

      <!-- Form Steps -->
      <mat-stepper [linear]="false" #stepper>
        <!-- Step 1: Applicant Info -->
        <mat-step [stepControl]="applicantForm" label="Demandeur">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="applicantForm">
                <h3>Informations du demandeur</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro contribuable</mat-label>
                    <input matInput formControlName="taxNumber">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Raison sociale</mat-label>
                    <input matInput formControlName="companyName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Représentant légal</mat-label>
                    <input matInput formControlName="representative">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="phone">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput formControlName="address" rows="2"></textarea>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 2: Request Details -->
        <mat-step [stepControl]="requestForm" label="Détails">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="requestForm">
                <h3>Détails de la demande</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Objet de la demande</mat-label>
                    <textarea matInput formControlName="subject" rows="3"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Référence déclaration</mat-label>
                    <input matInput formControlName="declarationRef" placeholder="Ex: IMP-2024-001234">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Pays d'origine/destination</mat-label>
                    <mat-select formControlName="country">
                      <mat-option value="CN">Chine</mat-option>
                      <mat-option value="FR">France</mat-option>
                      <mat-option value="US">États-Unis</mat-option>
                      <mat-option value="DE">Allemagne</mat-option>
                      <mat-option value="NG">Nigeria</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description des marchandises</mat-label>
                    <textarea matInput formControlName="goodsDescription" rows="3"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Quantité</mat-label>
                    <input matInput type="number" formControlName="quantity">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Valeur estimée</mat-label>
                    <input matInput type="number" formControlName="value">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Informations complémentaires</mat-label>
                    <textarea matInput formControlName="additionalInfo" rows="3"></textarea>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 3: Documents -->
        <mat-step label="Documents">
          <mat-card class="step-card">
            <mat-card-content>
              <h3>Documents requis</h3>
              <p class="hint">Téléchargez les documents requis pour compléter votre demande</p>

              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of requiredDocuments">
                  <div class="doc-info">
                    <mat-icon [class.uploaded]="doc.uploaded">
                      {{ doc.uploaded ? 'check_circle' : 'description' }}
                    </mat-icon>
                    <div>
                      <span class="doc-name">{{ doc.name }}</span>
                      <span class="doc-status" [class.required]="doc.required && !doc.uploaded">
                        {{ doc.uploaded ? 'Téléchargé' : (doc.required ? 'Requis' : 'Optionnel') }}
                      </span>
                    </div>
                  </div>
                  <button mat-stroked-button (click)="uploadDocument(doc)">
                    <mat-icon>{{ doc.uploaded ? 'refresh' : 'upload' }}</mat-icon>
                    {{ doc.uploaded ? 'Remplacer' : 'Télécharger' }}
                  </button>
                </div>
              </div>

              <button mat-stroked-button color="primary" class="add-doc-btn">
                <mat-icon>add</mat-icon>
                Ajouter un document supplémentaire
              </button>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 4: Summary -->
        <mat-step label="Récapitulatif">
          <mat-card class="step-card summary-card">
            <mat-card-content>
              <h3>Récapitulatif de la demande</h3>

              <div class="summary-sections">
                <div class="summary-section">
                  <h4>Procédure</h4>
                  <div class="summary-row">
                    <span class="label">Code:</span>
                    <span class="value">{{ procedure.code }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">Nom:</span>
                    <span class="value">{{ procedure.name }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">Frais estimés:</span>
                    <span class="value highlight">{{ procedure.fees }}</span>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Demandeur</h4>
                  <div class="summary-row">
                    <span class="label">Société:</span>
                    <span class="value">{{ applicantForm.get('companyName')?.value }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">N° Contribuable:</span>
                    <span class="value">{{ applicantForm.get('taxNumber')?.value }}</span>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Documents</h4>
                  <div class="docs-summary">
                    <div class="doc-item" *ngFor="let doc of requiredDocuments">
                      <mat-icon [class.success]="doc.uploaded" [class.pending]="!doc.uploaded">
                        {{ doc.uploaded ? 'check_circle' : 'pending' }}
                      </mat-icon>
                      <span>{{ doc.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="agreement-section">
                <mat-checkbox [(ngModel)]="agreed">
                  Je certifie l'exactitude des informations fournies et j'accepte les conditions générales d'utilisation.
                </mat-checkbox>
              </div>

              <div class="fees-notice">
                <mat-icon>info</mat-icon>
                <p>Les frais de {{ procedure.fees }} seront calculés et vous seront communiqués après validation de votre demande.</p>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-stroked-button (click)="saveDraft()">
                <mat-icon>save</mat-icon> Enregistrer brouillon
              </button>
              <button mat-flat-button color="primary" (click)="submit()" [disabled]="!canSubmit()">
                <mat-icon>send</mat-icon> Soumettre la demande
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .procedure-form-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        h1 {
          margin: 0;
          font-size: 24px;
        }

        p {
          margin: 4px 0 0;
          color: #757575;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .info-banner {
      display: flex;
      gap: 16px;
      padding: 16px;
      margin-bottom: 24px;
      background: #e3f2fd;

      > mat-icon {
        color: #1976d2;
      }

      .info-content {
        p {
          margin: 0 0 8px;
        }

        .info-meta {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: #616161;

          span {
            display: flex;
            align-items: center;
            gap: 4px;

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .step-card {
      margin: 24px 0;

      h3 {
        margin: 0 0 24px;
        font-size: 18px;
        font-weight: 500;
      }

      .hint {
        color: #757575;
        margin-bottom: 16px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .full-width {
        grid-column: 1 / -1;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;

      .document-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;

        .doc-info {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: #9e9e9e;

            &.uploaded {
              color: #4caf50;
            }
          }

          .doc-name {
            display: block;
            font-weight: 500;
          }

          .doc-status {
            font-size: 12px;
            color: #4caf50;

            &.required {
              color: #f57c00;
            }
          }
        }
      }
    }

    .add-doc-btn {
      margin-top: 16px;
    }

    .summary-card {
      .summary-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        margin-bottom: 24px;
      }

      .summary-section {
        h4 {
          font-size: 14px;
          text-transform: uppercase;
          color: #757575;
          margin: 0 0 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          .label {
            color: #757575;
          }

          .value {
            font-weight: 500;

            &.highlight {
              color: #1976d2;
            }
          }
        }
      }

      .docs-summary {
        .doc-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;

            &.success { color: #4caf50; }
            &.pending { color: #ff9800; }
          }
        }
      }

      .agreement-section {
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .fees-notice {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #fff3e0;
        border-radius: 8px;

        mat-icon {
          color: #f57c00;
        }

        p {
          margin: 0;
          color: #e65100;
        }
      }
    }
  `]
})
export class ProcedureFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  procedureCode = '';
  saving = false;
  agreed = false;

  procedure = {
    code: '',
    name: '',
    description: '',
    category: '',
    estimatedTime: '',
    fees: ''
  };

  applicantForm!: FormGroup;
  requestForm!: FormGroup;

  requiredDocuments = [
    { id: 'id', name: 'Pièce d\'identité du représentant', required: true, uploaded: false },
    { id: 'reg', name: 'Registre de commerce', required: true, uploaded: false },
    { id: 'invoice', name: 'Facture commerciale', required: true, uploaded: false },
    { id: 'other', name: 'Autres documents', required: false, uploaded: false }
  ];

  ngOnInit() {
    this.initForms();

    this.route.params.subscribe(params => {
      this.procedureCode = params['procedureCode'];
      this.loadProcedure();
    });
  }

  initForms() {
    this.applicantForm = this.fb.group({
      taxNumber: ['', Validators.required],
      companyName: ['', Validators.required],
      representative: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['']
    });

    this.requestForm = this.fb.group({
      subject: ['', Validators.required],
      declarationRef: [''],
      country: [''],
      goodsDescription: ['', Validators.required],
      quantity: [''],
      value: [''],
      additionalInfo: ['']
    });
  }

  loadProcedure() {
    // Load procedure details based on code
    const procedures: Record<string, any> = {
      'CERT-ORIG': {
        code: 'CERT-ORIG',
        name: 'Certificat d\'Origine',
        description: 'Demande de certificat d\'origine pour les marchandises exportées.',
        category: 'Export',
        estimatedTime: '2-3 jours',
        fees: '25 000 XAF'
      },
      'CERT-PHYTO': {
        code: 'CERT-PHYTO',
        name: 'Certificat Phytosanitaire',
        description: 'Certificat attestant la conformité aux normes phytosanitaires.',
        category: 'Export',
        estimatedTime: '3-5 jours',
        fees: '50 000 XAF'
      }
    };

    this.procedure = procedures[this.procedureCode] || {
      code: this.procedureCode,
      name: 'Procédure',
      description: 'Description de la procédure',
      category: 'Général',
      estimatedTime: '5-7 jours',
      fees: 'Variable'
    };
  }

  uploadDocument(doc: any) {
    doc.uploaded = true;
  }

  canSubmit(): boolean {
    const requiredUploaded = this.requiredDocuments
      .filter(d => d.required)
      .every(d => d.uploaded);

    return this.applicantForm.valid &&
           this.requestForm.valid &&
           requiredUploaded &&
           this.agreed;
  }

  saveDraft() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Brouillon enregistré', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  submit() {
    if (!this.canSubmit()) return;

    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Demande soumise avec succès', 'Fermer', { duration: 3000 });
      this.router.navigate(['/e-force/procedures']);
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/e-force/procedures']);
  }
}
