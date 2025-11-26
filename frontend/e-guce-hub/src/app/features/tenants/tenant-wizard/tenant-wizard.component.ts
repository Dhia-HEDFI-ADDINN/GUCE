import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TenantService } from '@core/services/tenant.service';

@Component({
  selector: 'hub-tenant-wizard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatSlideToggleModule
  ],
  template: `
    <div class="tenant-wizard">
      <div class="page-header">
        <h1>Creer une Nouvelle Instance GUCE</h1>
        <p class="page-description">Assistant de creation d'une nouvelle instance single-tenant</p>
      </div>

      <div class="wizard-container">
        <!-- Progress Steps -->
        <div class="wizard-steps">
          <div class="wizard-step" *ngFor="let step of steps; let i = index"
               [class.active]="currentStep === i" [class.completed]="currentStep > i">
            <div class="step-number">{{ currentStep > i ? '✓' : i + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <!-- Step 1: Informations Generales -->
          <div class="step-panel" *ngIf="currentStep === 0">
            <h2>Informations Generales</h2>
            <p class="step-description">Definissez l'identite de votre instance GUCE</p>

            <form [formGroup]="tenantForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Code Pays (2 lettres) *</label>
                  <input type="text" formControlName="code" maxlength="2" placeholder="CM" />
                </div>
                <div class="form-group">
                  <label>Nom de l'Instance *</label>
                  <input type="text" formControlName="name" placeholder="GUCE Cameroun" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Nom Court *</label>
                  <input type="text" formControlName="shortName" placeholder="GUCE-CM" />
                </div>
                <div class="form-group">
                  <label>Domaine *</label>
                  <input type="text" formControlName="domain" placeholder="guce-cameroun.com" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Fuseau Horaire *</label>
                  <select formControlName="timezone">
                    <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
                    <option value="Africa/Ndjamena">Africa/Ndjamena (UTC+1)</option>
                    <option value="Africa/Bangui">Africa/Bangui (UTC+1)</option>
                    <option value="Africa/Libreville">Africa/Libreville (UTC+1)</option>
                    <option value="Africa/Kinshasa">Africa/Kinshasa (UTC+1)</option>
                    <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Devise *</label>
                  <select formControlName="currency">
                    <option value="XAF">XAF - Franc CFA BEAC</option>
                    <option value="XOF">XOF - Franc CFA BCEAO</option>
                    <option value="USD">USD - Dollar US</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Couleur Principale</label>
                  <div class="color-picker">
                    <input type="color" formControlName="primaryColor" />
                    <span>{{ tenantForm.get('primaryColor')?.value }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Couleur Secondaire</label>
                  <div class="color-picker">
                    <input type="color" formControlName="secondaryColor" />
                    <span>{{ tenantForm.get('secondaryColor')?.value }}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Step 2: Configuration Technique -->
          <div class="step-panel" *ngIf="currentStep === 1">
            <h2>Configuration Technique</h2>
            <p class="step-description">Parametres techniques et de haute disponibilite</p>

            <form [formGroup]="technicalForm">
              <div class="form-group">
                <label>Environnement *</label>
                <div class="radio-group">
                  <label class="radio-option" [class.selected]="technicalForm.get('environment')?.value === 'development'">
                    <input type="radio" formControlName="environment" value="development" />
                    <mat-icon>code</mat-icon>
                    <div>
                      <span class="option-title">Developpement</span>
                      <span class="option-desc">Tests et developpement</span>
                    </div>
                  </label>
                  <label class="radio-option" [class.selected]="technicalForm.get('environment')?.value === 'staging'">
                    <input type="radio" formControlName="environment" value="staging" />
                    <mat-icon>science</mat-icon>
                    <div>
                      <span class="option-title">Pre-production</span>
                      <span class="option-desc">Validation avant prod</span>
                    </div>
                  </label>
                  <label class="radio-option" [class.selected]="technicalForm.get('environment')?.value === 'production'">
                    <input type="radio" formControlName="environment" value="production" />
                    <mat-icon>rocket_launch</mat-icon>
                    <div>
                      <span class="option-title">Production</span>
                      <span class="option-desc">Environnement live</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="config-section">
                <h3>Haute Disponibilite</h3>
                <div class="toggle-option">
                  <mat-slide-toggle formControlName="highAvailability">
                    Activer la haute disponibilite
                  </mat-slide-toggle>
                  <p class="option-hint">Replique les services sur plusieurs noeuds</p>
                </div>
              </div>

              <div class="config-section">
                <h3>Auto-Scaling</h3>
                <div class="toggle-option">
                  <mat-slide-toggle formControlName="autoScalingEnabled">
                    Activer l'auto-scaling
                  </mat-slide-toggle>
                </div>
                <div class="form-row" *ngIf="technicalForm.get('autoScalingEnabled')?.value">
                  <div class="form-group">
                    <label>Replicas Min</label>
                    <input type="number" formControlName="minReplicas" min="1" max="10" />
                  </div>
                  <div class="form-group">
                    <label>Replicas Max</label>
                    <input type="number" formControlName="maxReplicas" min="2" max="50" />
                  </div>
                </div>
              </div>

              <div class="config-section">
                <h3>Sauvegardes</h3>
                <div class="toggle-option">
                  <mat-slide-toggle formControlName="backupEnabled">
                    Activer les sauvegardes automatiques
                  </mat-slide-toggle>
                </div>
                <div class="form-row" *ngIf="technicalForm.get('backupEnabled')?.value">
                  <div class="form-group">
                    <label>Frequence</label>
                    <select formControlName="backupFrequency">
                      <option value="hourly">Toutes les heures</option>
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Retention (jours)</label>
                    <input type="number" formControlName="backupRetention" min="7" max="365" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Step 3: Modules -->
          <div class="step-panel" *ngIf="currentStep === 2">
            <h2>Modules a Activer</h2>
            <p class="step-description">Selectionnez les modules a deployer sur cette instance</p>

            <div class="modules-grid">
              <div class="module-card" *ngFor="let module of availableModules"
                   [class.selected]="module.enabled" (click)="toggleModule(module)">
                <div class="module-header">
                  <mat-icon>{{ module.icon }}</mat-icon>
                  <mat-checkbox [checked]="module.enabled" (click)="$event.stopPropagation()"></mat-checkbox>
                </div>
                <h3>{{ module.name }}</h3>
                <p>{{ module.description }}</p>
                <div class="module-features" *ngIf="module.enabled">
                  <label *ngFor="let feature of module.features">
                    <input type="checkbox" [(ngModel)]="feature.enabled" />
                    {{ feature.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Administrateurs -->
          <div class="step-panel" *ngIf="currentStep === 3">
            <h2>Administrateurs Initiaux</h2>
            <p class="step-description">Definissez les premiers administrateurs de l'instance</p>

            <div class="admin-list">
              <div class="admin-card" *ngFor="let admin of initialAdmins; let i = index">
                <div class="admin-header">
                  <h4>Administrateur {{ i + 1 }}</h4>
                  <button class="remove-btn" (click)="removeAdmin(i)" *ngIf="initialAdmins.length > 1">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" [(ngModel)]="admin.email" placeholder="admin@example.com" />
                  </div>
                  <div class="form-group">
                    <label>Role *</label>
                    <select [(ngModel)]="admin.role">
                      <option value="SUPER_ADMIN_INSTANCE">Super Admin Instance</option>
                      <option value="ADMIN_FONCTIONNEL">Admin Fonctionnel</option>
                      <option value="ADMIN_TECHNIQUE">Admin Technique</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Prenom *</label>
                    <input type="text" [(ngModel)]="admin.firstName" placeholder="Jean" />
                  </div>
                  <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" [(ngModel)]="admin.lastName" placeholder="DUPONT" />
                  </div>
                </div>
              </div>
            </div>

            <button class="btn-secondary add-admin-btn" (click)="addAdmin()">
              <mat-icon>add</mat-icon>
              Ajouter un administrateur
            </button>
          </div>

          <!-- Step 5: Infrastructure -->
          <div class="step-panel" *ngIf="currentStep === 4">
            <h2>Infrastructure Cible</h2>
            <p class="step-description">Configurez l'infrastructure de deploiement</p>

            <form [formGroup]="infraForm">
              <div class="form-group">
                <label>Fournisseur Cloud *</label>
                <div class="provider-grid">
                  <label class="provider-option" *ngFor="let provider of cloudProviders"
                         [class.selected]="infraForm.get('provider')?.value === provider.id">
                    <input type="radio" formControlName="provider" [value]="provider.id" />
                    <img [src]="provider.logo" [alt]="provider.name" />
                    <span>{{ provider.name }}</span>
                  </label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Region *</label>
                  <select formControlName="region">
                    <option value="eu-west-paris">Europe - Paris</option>
                    <option value="eu-west-frankfurt">Europe - Frankfurt</option>
                    <option value="af-south-johannesburg">Afrique - Johannesburg</option>
                    <option value="af-north-cairo">Afrique - Le Caire</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Version Kubernetes *</label>
                  <select formControlName="kubernetesVersion">
                    <option value="1.30">Kubernetes 1.30 (Latest)</option>
                    <option value="1.29">Kubernetes 1.29</option>
                    <option value="1.28">Kubernetes 1.28</option>
                  </select>
                </div>
              </div>

              <div class="config-section">
                <h3>Noeuds de Calcul</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type de Machine</label>
                    <select formControlName="machineType">
                      <option value="small">Small (2 vCPU, 4GB RAM)</option>
                      <option value="medium">Medium (4 vCPU, 8GB RAM)</option>
                      <option value="large">Large (8 vCPU, 16GB RAM)</option>
                      <option value="xlarge">X-Large (16 vCPU, 32GB RAM)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Nombre de Noeuds</label>
                    <input type="number" formControlName="nodeCount" min="1" max="20" />
                  </div>
                </div>
              </div>

              <div class="config-section">
                <h3>Base de Donnees</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type</label>
                    <select formControlName="databaseType">
                      <option value="postgresql">PostgreSQL</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Taille</label>
                    <select formControlName="databaseSize">
                      <option value="small">Small (2 vCPU, 4GB RAM, 100GB)</option>
                      <option value="medium">Medium (4 vCPU, 8GB RAM, 250GB)</option>
                      <option value="large">Large (8 vCPU, 16GB RAM, 500GB)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="config-section">
                <h3>Stockage</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label>Taille du Stockage</label>
                    <select formControlName="storageSize">
                      <option value="100Gi">100 Go</option>
                      <option value="250Gi">250 Go</option>
                      <option value="500Gi">500 Go</option>
                      <option value="1Ti">1 To</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Step 6: Confirmation -->
          <div class="step-panel" *ngIf="currentStep === 5">
            <h2>Confirmation et Deploiement</h2>
            <p class="step-description">Verifiez les parametres avant de lancer le deploiement</p>

            <div class="summary-section">
              <h3>Resume de l'Instance</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Nom</span>
                  <span class="value">{{ tenantForm.get('name')?.value }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Code</span>
                  <span class="value">{{ tenantForm.get('code')?.value }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Domaine</span>
                  <span class="value">{{ tenantForm.get('domain')?.value }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Environnement</span>
                  <span class="value">{{ technicalForm.get('environment')?.value }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Modules</span>
                  <span class="value">{{ getEnabledModulesCount() }} modules actifs</span>
                </div>
                <div class="summary-item">
                  <span class="label">Administrateurs</span>
                  <span class="value">{{ initialAdmins.length }} administrateur(s)</span>
                </div>
                <div class="summary-item">
                  <span class="label">Infrastructure</span>
                  <span class="value">{{ infraForm.get('provider')?.value }} - {{ infraForm.get('region')?.value }}</span>
                </div>
              </div>
            </div>

            <div class="deploy-info">
              <mat-icon>info</mat-icon>
              <p>Le deploiement prendra environ 10-15 minutes. Vous recevrez une notification par email une fois termine.</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="wizard-nav">
          <button class="btn-secondary" (click)="previousStep()" [disabled]="currentStep === 0">
            <mat-icon>arrow_back</mat-icon>
            Precedent
          </button>
          <button class="btn-primary" (click)="nextStep()" *ngIf="currentStep < steps.length - 1">
            Suivant
            <mat-icon>arrow_forward</mat-icon>
          </button>
          <button class="btn-primary deploy-btn" (click)="deploy()" *ngIf="currentStep === steps.length - 1" [disabled]="isDeploying">
            <mat-icon>rocket_launch</mat-icon>
            {{ isDeploying ? 'Deploiement en cours...' : 'Deployer l\'Instance' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenant-wizard {
      max-width: 900px;
      margin: 0 auto;
    }

    .wizard-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .wizard-steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 40px;
        right: 40px;
        height: 2px;
        background: #e0e0e0;
      }
    }

    .wizard-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e0e0e0;
        color: #757575;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .step-label {
        font-size: 12px;
        color: #757575;
        text-align: center;
        max-width: 80px;
      }

      &.active .step-number {
        background: #1a237e;
        color: white;
      }

      &.completed .step-number {
        background: #2e7d32;
        color: white;
      }
    }

    .step-panel {
      min-height: 400px;

      h2 {
        font-size: 20px;
        margin-bottom: 8px;
      }

      .step-description {
        color: #757575;
        margin-bottom: 24px;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
      }

      input, select {
        width: 100%;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #1a237e;
        }
      }
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 12px;

      input[type="color"] {
        width: 48px;
        height: 48px;
        padding: 0;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      span {
        font-family: monospace;
        color: #757575;
      }
    }

    .radio-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      input {
        display: none;
      }

      mat-icon {
        color: #757575;
      }

      .option-title {
        display: block;
        font-weight: 500;
      }

      .option-desc {
        display: block;
        font-size: 12px;
        color: #9e9e9e;
      }

      &.selected {
        border-color: #1a237e;
        background: #e8eaf6;

        mat-icon {
          color: #1a237e;
        }
      }
    }

    .config-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f5f5f5;

      h3 {
        font-size: 16px;
        margin-bottom: 16px;
      }
    }

    .toggle-option {
      margin-bottom: 16px;

      .option-hint {
        font-size: 12px;
        color: #9e9e9e;
        margin-top: 4px;
      }
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .module-card {
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #1a237e;
      }

      &.selected {
        border-color: #1a237e;
        background: #e8eaf6;
      }

      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        mat-icon {
          font-size: 28px;
          color: #1a237e;
        }
      }

      h3 {
        font-size: 16px;
        margin-bottom: 8px;
      }

      p {
        font-size: 13px;
        color: #757575;
        margin-bottom: 12px;
      }

      .module-features {
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;

        label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 4px;
        }
      }
    }

    .admin-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .admin-card {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;

      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          font-size: 14px;
          color: #1a237e;
        }

        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #c62828;
        }
      }
    }

    .add-admin-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .provider-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .provider-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      input {
        display: none;
      }

      img {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }

      span {
        font-size: 12px;
        font-weight: 500;
      }

      &.selected {
        border-color: #1a237e;
        background: #e8eaf6;
      }
    }

    .summary-section {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        margin-bottom: 16px;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;

      .label {
        font-size: 12px;
        color: #757575;
      }

      .value {
        font-weight: 500;
      }
    }

    .deploy-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;

      mat-icon {
        color: #1565c0;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #1565c0;
      }
    }

    .wizard-nav {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .deploy-btn {
        background: #2e7d32;

        &:hover {
          background: #1b5e20;
        }
      }
    }
  `]
})
export class TenantWizardComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  currentStep = 0;
  isDeploying = false;

  steps = [
    { label: 'Informations' },
    { label: 'Technique' },
    { label: 'Modules' },
    { label: 'Admins' },
    { label: 'Infrastructure' },
    { label: 'Deploiement' }
  ];

  tenantForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(2)]],
    name: ['', Validators.required],
    shortName: ['', Validators.required],
    domain: ['', Validators.required],
    timezone: ['Africa/Douala', Validators.required],
    currency: ['XAF', Validators.required],
    primaryColor: ['#1a237e'],
    secondaryColor: ['#ff6f00']
  });

  technicalForm = this.fb.group({
    environment: ['production', Validators.required],
    highAvailability: [true],
    autoScalingEnabled: [true],
    minReplicas: [2],
    maxReplicas: [10],
    backupEnabled: [true],
    backupFrequency: ['daily'],
    backupRetention: [30]
  });

  infraForm = this.fb.group({
    provider: ['ovh', Validators.required],
    region: ['eu-west-paris', Validators.required],
    kubernetesVersion: ['1.30', Validators.required],
    machineType: ['medium', Validators.required],
    nodeCount: [3, [Validators.required, Validators.min(1)]],
    databaseType: ['postgresql'],
    databaseSize: ['medium'],
    storageSize: ['250Gi']
  });

  availableModules = [
    {
      id: 'eForce', name: 'e-Force', icon: 'business_center', enabled: true,
      description: 'Portail des operateurs economiques',
      features: [
        { id: 'declarations', name: 'Declarations', enabled: true },
        { id: 'documents', name: 'Documents', enabled: true },
        { id: 'payments', name: 'Paiements', enabled: true },
        { id: 'tracking', name: 'Suivi', enabled: true }
      ]
    },
    {
      id: 'eGov', name: 'e-Gov', icon: 'account_balance', enabled: true,
      description: 'Interface des administrations',
      features: [
        { id: 'inbox', name: 'Corbeille', enabled: true },
        { id: 'processing', name: 'Traitement', enabled: true },
        { id: 'decisions', name: 'Decisions', enabled: true },
        { id: 'statistics', name: 'Statistiques', enabled: true }
      ]
    },
    {
      id: 'eBusiness', name: 'e-Business', icon: 'storefront', enabled: true,
      description: 'Portail des intermediaires agrees',
      features: [
        { id: 'clients', name: 'Gestion clients', enabled: true },
        { id: 'declarations', name: 'Declarations', enabled: true },
        { id: 'billing', name: 'Facturation', enabled: true }
      ]
    },
    {
      id: 'ePayment', name: 'e-Payment', icon: 'payment', enabled: true,
      description: 'Module de paiement en ligne',
      features: [
        { id: 'mobileMoney', name: 'Mobile Money', enabled: true },
        { id: 'card', name: 'Carte bancaire', enabled: true },
        { id: 'bankTransfer', name: 'Virement', enabled: true }
      ]
    },
    {
      id: 'procedureBuilder', name: 'Procedure Builder', icon: 'build', enabled: true,
      description: 'Configuration des procedures',
      features: [
        { id: 'workflowDesigner', name: 'Workflow Designer', enabled: true },
        { id: 'formBuilder', name: 'Form Builder', enabled: true },
        { id: 'rulesEditor', name: 'Rules Editor', enabled: true }
      ]
    },
    {
      id: 'admin', name: 'Admin Local', icon: 'admin_panel_settings', enabled: true,
      description: 'Administration de l\'instance',
      features: [
        { id: 'users', name: 'Utilisateurs', enabled: true },
        { id: 'roles', name: 'Roles', enabled: true },
        { id: 'audit', name: 'Audit', enabled: true }
      ]
    }
  ];

  initialAdmins = [
    { email: '', firstName: '', lastName: '', role: 'SUPER_ADMIN_INSTANCE', tempPassword: true }
  ];

  cloudProviders = [
    { id: 'ovh', name: 'OVH Cloud', logo: 'assets/providers/ovh.svg' },
    { id: 'aws', name: 'AWS', logo: 'assets/providers/aws.svg' },
    { id: 'gcp', name: 'Google Cloud', logo: 'assets/providers/gcp.svg' },
    { id: 'azure', name: 'Azure', logo: 'assets/providers/azure.svg' }
  ];

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  toggleModule(module: any): void {
    module.enabled = !module.enabled;
  }

  addAdmin(): void {
    this.initialAdmins.push({
      email: '', firstName: '', lastName: '', role: 'ADMIN_FONCTIONNEL', tempPassword: true
    });
  }

  removeAdmin(index: number): void {
    this.initialAdmins.splice(index, 1);
  }

  getEnabledModulesCount(): number {
    return this.availableModules.filter(m => m.enabled).length;
  }

  deploy(): void {
    this.isDeploying = true;

    const request = {
      tenant: this.tenantForm.value,
      technical: {
        environment: this.technicalForm.get('environment')?.value,
        highAvailability: this.technicalForm.get('highAvailability')?.value,
        autoScaling: {
          enabled: this.technicalForm.get('autoScalingEnabled')?.value,
          minReplicas: this.technicalForm.get('minReplicas')?.value,
          maxReplicas: this.technicalForm.get('maxReplicas')?.value
        },
        backup: {
          enabled: this.technicalForm.get('backupEnabled')?.value,
          frequency: this.technicalForm.get('backupFrequency')?.value,
          retention: this.technicalForm.get('backupRetention')?.value
        }
      },
      modules: this.availableModules.reduce((acc, m) => {
        acc[m.id] = {
          enabled: m.enabled,
          features: m.features.filter(f => f.enabled).map(f => f.id)
        };
        return acc;
      }, {} as any),
      initialAdmins: this.initialAdmins,
      infrastructure: this.infraForm.value
    };

    this.tenantService.create(request as any).subscribe({
      next: (tenant) => {
        this.isDeploying = false;
        this.router.navigate(['/tenants', tenant.id, 'overview']);
      },
      error: () => {
        this.isDeploying = false;
      }
    });
  }
}
