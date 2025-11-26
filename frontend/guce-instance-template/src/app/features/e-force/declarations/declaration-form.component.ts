import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'guce-declaration-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatAutocompleteModule, MatChipsModule, MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="declaration-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>{{ isEdit ? 'Modifier la déclaration' : 'Nouvelle déclaration ' + getTypeLabel() }}</h1>
            <p *ngIf="isEdit">Référence: {{ declarationId }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="saveDraft()" [disabled]="saving">
            <mat-icon>save</mat-icon>
            Enregistrer brouillon
          </button>
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving || !canSubmit()">
            <mat-icon>send</mat-icon>
            Soumettre
          </button>
        </div>
      </div>

      <!-- Stepper Form -->
      <mat-stepper [linear]="false" #stepper>
        <!-- Step 1: General Info -->
        <mat-step [stepControl]="generalForm" label="Informations générales">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="generalForm">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Type de déclaration</mat-label>
                    <mat-select formControlName="type">
                      <mat-option value="import">Import</mat-option>
                      <mat-option value="export">Export</mat-option>
                      <mat-option value="transit">Transit</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Régime douanier</mat-label>
                    <mat-select formControlName="regime">
                      <mat-option value="IM4">IM4 - Mise à la consommation</mat-option>
                      <mat-option value="IM5">IM5 - Admission temporaire</mat-option>
                      <mat-option value="IM7">IM7 - Mise en entrepôt</mat-option>
                      <mat-option value="EX1">EX1 - Exportation définitive</mat-option>
                      <mat-option value="EX2">EX2 - Exportation temporaire</mat-option>
                      <mat-option value="TR1">TR1 - Transit national</mat-option>
                      <mat-option value="TR2">TR2 - Transit international</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Bureau de douane</mat-label>
                    <mat-select formControlName="customsOffice">
                      <mat-option value="DLA">Douala Port</mat-option>
                      <mat-option value="DLA-A">Douala Aéroport</mat-option>
                      <mat-option value="YDE">Yaoundé</mat-option>
                      <mat-option value="KBI">Kribi Port</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Mode de transport</mat-label>
                    <mat-select formControlName="transportMode">
                      <mat-option value="sea">Maritime</mat-option>
                      <mat-option value="air">Aérien</mat-option>
                      <mat-option value="road">Routier</mat-option>
                      <mat-option value="rail">Ferroviaire</mat-option>
                    </mat-select>
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

        <!-- Step 2: Parties -->
        <mat-step [stepControl]="partiesForm" label="Parties">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="partiesForm">
                <h3>{{ type === 'import' ? 'Importateur' : 'Exportateur' }}</h3>
                <div class="form-grid" formGroupName="importer">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro contribuable</mat-label>
                    <input matInput formControlName="taxNumber" placeholder="M123456789">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Raison sociale</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput formControlName="address" rows="2"></textarea>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <h3>{{ type === 'import' ? 'Expéditeur' : 'Destinataire' }}</h3>
                <div class="form-grid" formGroupName="shipper">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom / Raison sociale</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Pays</mat-label>
                    <mat-select formControlName="country">
                      <mat-option value="CN">Chine</mat-option>
                      <mat-option value="FR">France</mat-option>
                      <mat-option value="US">États-Unis</mat-option>
                      <mat-option value="DE">Allemagne</mat-option>
                      <mat-option value="NG">Nigeria</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput formControlName="address" rows="2"></textarea>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <h3>Déclarant</h3>
                <div class="form-grid" formGroupName="declarant">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro agrément</mat-label>
                    <input matInput formControlName="licenseNumber">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom du déclarant</mat-label>
                    <input matInput formControlName="name">
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

        <!-- Step 3: Goods -->
        <mat-step [stepControl]="goodsForm" label="Marchandises">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="goodsForm">
                <div class="goods-header">
                  <h3>Articles ({{ goodsItems.length }})</h3>
                  <button mat-stroked-button color="primary" (click)="addGoodsItem()">
                    <mat-icon>add</mat-icon> Ajouter un article
                  </button>
                </div>

                <div formArrayName="items">
                  <mat-card class="goods-item-card" *ngFor="let item of goodsItems.controls; let i = index" [formGroupName]="i">
                    <div class="item-header">
                      <span class="item-number">Article {{ i + 1 }}</span>
                      <button mat-icon-button color="warn" (click)="removeGoodsItem(i)" *ngIf="goodsItems.length > 1">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Code SH</mat-label>
                        <input matInput formControlName="hsCode" placeholder="8471.30.00">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Description</mat-label>
                        <textarea matInput formControlName="description" rows="2"></textarea>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Pays d'origine</mat-label>
                        <mat-select formControlName="originCountry">
                          <mat-option value="CN">Chine</mat-option>
                          <mat-option value="FR">France</mat-option>
                          <mat-option value="US">États-Unis</mat-option>
                          <mat-option value="DE">Allemagne</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Quantité</mat-label>
                        <input matInput type="number" formControlName="quantity">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Unité</mat-label>
                        <mat-select formControlName="unit">
                          <mat-option value="KG">Kilogrammes</mat-option>
                          <mat-option value="U">Unités</mat-option>
                          <mat-option value="L">Litres</mat-option>
                          <mat-option value="M">Mètres</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Poids brut (kg)</mat-label>
                        <input matInput type="number" formControlName="grossWeight">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Poids net (kg)</mat-label>
                        <input matInput type="number" formControlName="netWeight">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Valeur FOB</mat-label>
                        <input matInput type="number" formControlName="fobValue">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Devise</mat-label>
                        <mat-select formControlName="currency">
                          <mat-option value="USD">USD</mat-option>
                          <mat-option value="EUR">EUR</mat-option>
                          <mat-option value="XAF">XAF</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </mat-card>
                </div>

                <!-- Totals -->
                <div class="totals-section">
                  <div class="total-item">
                    <span>Total articles:</span>
                    <strong>{{ goodsItems.length }}</strong>
                  </div>
                  <div class="total-item">
                    <span>Poids brut total:</span>
                    <strong>{{ calculateTotalWeight() }} kg</strong>
                  </div>
                  <div class="total-item">
                    <span>Valeur FOB totale:</span>
                    <strong>{{ formatCurrency(calculateTotalValue()) }}</strong>
                  </div>
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

        <!-- Step 4: Documents -->
        <mat-step [stepControl]="documentsForm" label="Documents">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="documentsForm">
                <div class="documents-section">
                  <h3>Documents requis</h3>
                  <p class="hint">Téléchargez les documents justificatifs pour votre déclaration</p>

                  <div class="document-list">
                    <div class="document-item" *ngFor="let doc of requiredDocuments">
                      <div class="doc-info">
                        <mat-icon>{{ doc.uploaded ? 'check_circle' : 'description' }}</mat-icon>
                        <div>
                          <span class="doc-name">{{ doc.name }}</span>
                          <span class="doc-status" [class.uploaded]="doc.uploaded">
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
                    Ajouter un autre document
                  </button>
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

        <!-- Step 5: Summary -->
        <mat-step label="Récapitulatif">
          <mat-card class="step-card summary-card">
            <mat-card-content>
              <h3>Récapitulatif de la déclaration</h3>

              <div class="summary-section">
                <h4>Informations générales</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Type:</span>
                    <span class="value">{{ getTypeLabel() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Régime:</span>
                    <span class="value">{{ generalForm.get('regime')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Bureau:</span>
                    <span class="value">{{ generalForm.get('customsOffice')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Transport:</span>
                    <span class="value">{{ generalForm.get('transportMode')?.value }}</span>
                  </div>
                </div>
              </div>

              <div class="summary-section">
                <h4>Marchandises</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Nombre d'articles:</span>
                    <span class="value">{{ goodsItems.length }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Poids brut total:</span>
                    <span class="value">{{ calculateTotalWeight() }} kg</span>
                  </div>
                  <div class="summary-item highlight">
                    <span class="label">Valeur FOB totale:</span>
                    <span class="value">{{ formatCurrency(calculateTotalValue()) }}</span>
                  </div>
                </div>
              </div>

              <div class="summary-section">
                <h4>Documents</h4>
                <div class="documents-status">
                  <div class="doc-status-item" *ngFor="let doc of requiredDocuments">
                    <mat-icon [class.success]="doc.uploaded" [class.pending]="!doc.uploaded">
                      {{ doc.uploaded ? 'check_circle' : 'pending' }}
                    </mat-icon>
                    <span>{{ doc.name }}</span>
                  </div>
                </div>
              </div>

              <div class="declaration-notice">
                <mat-checkbox formControlName="confirmed">
                  Je certifie que les informations fournies sont exactes et complètes.
                  Je comprends que toute fausse déclaration peut entraîner des sanctions.
                </mat-checkbox>
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
                <mat-icon>send</mat-icon> Soumettre la déclaration
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .declaration-form-container {
      padding: 24px;
      max-width: 1200px;
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

    .step-card {
      margin: 24px 0;

      h3 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 500;
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

    mat-divider {
      margin: 24px 0;
    }

    .goods-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .goods-item-card {
      margin-bottom: 16px;
      padding: 16px;
      background: #fafafa;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .item-number {
          font-weight: 600;
          color: #1976d2;
        }
      }
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      gap: 32px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;
      margin-top: 16px;

      .total-item {
        display: flex;
        gap: 8px;
        font-size: 14px;

        strong {
          font-size: 16px;
        }
      }
    }

    .documents-section {
      .hint {
        color: #757575;
        margin-bottom: 24px;
      }

      .document-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

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
            font-weight: 500;
            display: block;
          }

          .doc-status {
            font-size: 12px;
            color: #f57c00;

            &.uploaded {
              color: #4caf50;
            }
          }
        }
      }

      .add-doc-btn {
        margin-top: 16px;
      }
    }

    .summary-card {
      .summary-section {
        margin-bottom: 24px;

        h4 {
          font-size: 14px;
          text-transform: uppercase;
          color: #757575;
          margin: 0 0 12px;
        }
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #fafafa;
          border-radius: 4px;

          .label {
            color: #757575;
          }

          .value {
            font-weight: 500;
          }

          &.highlight {
            background: #e3f2fd;

            .value {
              color: #1976d2;
              font-size: 18px;
            }
          }
        }
      }

      .documents-status {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .doc-status-item {
          display: flex;
          align-items: center;
          gap: 8px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;

            &.success { color: #4caf50; }
            &.pending { color: #ff9800; }
          }
        }
      }

      .declaration-notice {
        padding: 16px;
        background: #fff3e0;
        border-radius: 8px;
        margin-top: 24px;
      }
    }
  `]
})
export class DeclarationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  type = 'import';
  isEdit = false;
  declarationId = '';
  saving = false;

  generalForm!: FormGroup;
  partiesForm!: FormGroup;
  goodsForm!: FormGroup;
  documentsForm!: FormGroup;
  confirmed = false;

  requiredDocuments = [
    { id: 'invoice', name: 'Facture commerciale', required: true, uploaded: false },
    { id: 'packing', name: 'Liste de colisage', required: true, uploaded: false },
    { id: 'bl', name: 'Connaissement / LTA', required: true, uploaded: false },
    { id: 'origin', name: 'Certificat d\'origine', required: false, uploaded: false },
    { id: 'conformity', name: 'Certificat de conformité', required: false, uploaded: false }
  ];

  ngOnInit() {
    this.initForms();

    this.route.params.subscribe(params => {
      this.type = params['type'] || 'import';
      this.declarationId = params['id'];
      this.isEdit = !!this.declarationId;

      if (this.isEdit) {
        this.loadDeclaration();
      }

      this.generalForm.patchValue({ type: this.type });
    });
  }

  initForms() {
    this.generalForm = this.fb.group({
      type: ['import', Validators.required],
      regime: ['', Validators.required],
      customsOffice: ['', Validators.required],
      transportMode: ['', Validators.required]
    });

    this.partiesForm = this.fb.group({
      importer: this.fb.group({
        taxNumber: ['', Validators.required],
        name: ['', Validators.required],
        address: ['']
      }),
      shipper: this.fb.group({
        name: ['', Validators.required],
        country: ['', Validators.required],
        address: ['']
      }),
      declarant: this.fb.group({
        licenseNumber: [''],
        name: ['']
      })
    });

    this.goodsForm = this.fb.group({
      items: this.fb.array([this.createGoodsItem()])
    });

    this.documentsForm = this.fb.group({});
  }

  createGoodsItem(): FormGroup {
    return this.fb.group({
      hsCode: ['', Validators.required],
      description: ['', Validators.required],
      originCountry: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['KG', Validators.required],
      grossWeight: [0, Validators.required],
      netWeight: [0, Validators.required],
      fobValue: [0, Validators.required],
      currency: ['USD', Validators.required]
    });
  }

  get goodsItems(): FormArray {
    return this.goodsForm.get('items') as FormArray;
  }

  addGoodsItem() {
    this.goodsItems.push(this.createGoodsItem());
  }

  removeGoodsItem(index: number) {
    this.goodsItems.removeAt(index);
  }

  loadDeclaration() {
    // Load existing declaration data
    console.log('Loading declaration', this.declarationId);
  }

  calculateTotalWeight(): number {
    return this.goodsItems.controls.reduce((sum, item) => {
      return sum + (item.get('grossWeight')?.value || 0);
    }, 0);
  }

  calculateTotalValue(): number {
    return this.goodsItems.controls.reduce((sum, item) => {
      return sum + (item.get('fobValue')?.value || 0);
    }, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getTypeLabel(): string {
    const labels: Record<string, string> = {
      import: 'd\'importation',
      export: 'd\'exportation',
      transit: 'de transit'
    };
    return labels[this.type] || '';
  }

  uploadDocument(doc: any) {
    // Open file picker and upload
    doc.uploaded = true;
  }

  canSubmit(): boolean {
    return this.generalForm.valid &&
           this.partiesForm.valid &&
           this.goodsForm.valid &&
           this.confirmed;
  }

  saveDraft() {
    this.saving = true;
    // Save as draft
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Brouillon enregistré', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  submit() {
    if (!this.canSubmit()) return;

    this.saving = true;
    // Submit declaration
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Déclaration soumise avec succès', 'Fermer', { duration: 3000 });
      this.router.navigate(['/e-force/declarations', this.type]);
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/e-force/declarations', this.type]);
  }
}
