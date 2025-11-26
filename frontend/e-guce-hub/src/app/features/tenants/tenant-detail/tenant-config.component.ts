import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TenantService } from '@core/services/tenant.service';
import { Tenant } from '@core/models/tenant.model';

@Component({
  selector: 'hub-tenant-config',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatIconModule, MatInputModule, MatSelectModule, MatFormFieldModule,
    MatSnackBarModule, MatTabsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Configuration</h1>
          <p class="page-description">Parametres de l'instance {{ tenant?.name }}</p>
        </div>
        <button class="btn-primary" (click)="saveConfig()" [disabled]="!configForm.dirty || saving || !configForm.valid">
          <mat-icon>{{ saving ? 'sync' : 'save' }}</mat-icon>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>

      <div class="config-content" *ngIf="!loading && configForm">
        <mat-tab-group animationDuration="0ms">
          <!-- General Tab -->
          <mat-tab label="General">
            <div class="tab-content">
              <div class="config-section">
                <h3><mat-icon>info</mat-icon> Informations Generales</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Code Instance</mat-label>
                    <input matInput [formControl]="configForm.get('code')!" readonly>
                    <mat-hint>Non modifiable</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom de l'Instance</mat-label>
                    <input matInput [formControl]="configForm.get('name')!">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom Court</mat-label>
                    <input matInput [formControl]="configForm.get('shortName')!">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Domaine</mat-label>
                    <input matInput [formControl]="configForm.get('domain')!">
                    <mat-icon matSuffix>language</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <div class="config-section">
                <h3><mat-icon>public</mat-icon> Localisation</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Pays</mat-label>
                    <input matInput [formControl]="configForm.get('country')!">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Devise</mat-label>
                    <mat-select [formControl]="configForm.get('currency')!">
                      <mat-option value="XAF">XAF - Franc CFA CEMAC</mat-option>
                      <mat-option value="XOF">XOF - Franc CFA UEMOA</mat-option>
                      <mat-option value="EUR">EUR - Euro</mat-option>
                      <mat-option value="USD">USD - Dollar US</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Fuseau Horaire</mat-label>
                    <mat-select [formControl]="configForm.get('timezone')!">
                      <mat-option value="Africa/Douala">Africa/Douala (UTC+1)</mat-option>
                      <mat-option value="Africa/Ndjamena">Africa/Ndjamena (UTC+1)</mat-option>
                      <mat-option value="Africa/Bangui">Africa/Bangui (UTC+1)</mat-option>
                      <mat-option value="Africa/Libreville">Africa/Libreville (UTC+1)</mat-option>
                      <mat-option value="Africa/Brazzaville">Africa/Brazzaville (UTC+1)</mat-option>
                      <mat-option value="Africa/Malabo">Africa/Malabo (UTC+1)</mat-option>
                      <mat-option value="Europe/Paris">Europe/Paris (UTC+1/+2)</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Locale</mat-label>
                    <mat-select [formControl]="configForm.get('locale')!">
                      <mat-option value="fr-CM">Francais (Cameroun)</mat-option>
                      <mat-option value="fr-TD">Francais (Tchad)</mat-option>
                      <mat-option value="fr-CF">Francais (RCA)</mat-option>
                      <mat-option value="fr-GA">Francais (Gabon)</mat-option>
                      <mat-option value="fr-CG">Francais (Congo)</mat-option>
                      <mat-option value="fr-GQ">Francais (Guinee Eq.)</mat-option>
                      <mat-option value="en-CM">English (Cameroon)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Branding Tab -->
          <mat-tab label="Branding">
            <div class="tab-content">
              <div class="config-section">
                <h3><mat-icon>palette</mat-icon> Couleurs</h3>
                <div class="form-grid cols-3">
                  <div class="color-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Couleur Principale</mat-label>
                      <input matInput [formControl]="configForm.get('primaryColor')!">
                    </mat-form-field>
                    <div class="color-preview" [style.background]="configForm.get('primaryColor')?.value"></div>
                  </div>

                  <div class="color-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Couleur Secondaire</mat-label>
                      <input matInput [formControl]="configForm.get('secondaryColor')!">
                    </mat-form-field>
                    <div class="color-preview" [style.background]="configForm.get('secondaryColor')?.value"></div>
                  </div>

                  <div class="color-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Couleur d'Accent</mat-label>
                      <input matInput [formControl]="configForm.get('accentColor')!">
                    </mat-form-field>
                    <div class="color-preview" [style.background]="configForm.get('accentColor')?.value"></div>
                  </div>
                </div>

                <div class="branding-preview">
                  <h4>Apercu</h4>
                  <div class="preview-header" [style.background]="configForm.get('primaryColor')?.value">
                    <span class="preview-logo">{{ tenant?.code }}</span>
                    <span class="preview-title">{{ configForm.get('name')?.value }}</span>
                  </div>
                  <div class="preview-accent" [style.background]="configForm.get('secondaryColor')?.value">
                    Barre d'action
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Technical Tab -->
          <mat-tab label="Technique">
            <div class="tab-content">
              <div class="config-section">
                <h3><mat-icon>dns</mat-icon> Infrastructure</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Provider</span>
                    <span class="info-value">{{ tenant?.infrastructure?.provider || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Region</span>
                    <span class="info-value">{{ tenant?.infrastructure?.region || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Kubernetes</span>
                    <span class="info-value">v{{ tenant?.infrastructure?.kubernetesVersion || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Noeuds</span>
                    <span class="info-value">{{ tenant?.infrastructure?.nodeCount || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Base de Donnees</span>
                    <span class="info-value">{{ tenant?.infrastructure?.databaseType || 'PostgreSQL' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Stockage</span>
                    <span class="info-value">{{ tenant?.infrastructure?.storageSize || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <div class="config-section">
                <h3><mat-icon>link</mat-icon> Endpoints</h3>
                <div class="endpoints-list">
                  <div class="endpoint-item">
                    <span class="endpoint-label">Frontend URL</span>
                    <code class="endpoint-value">https://{{ tenant?.domain }}</code>
                  </div>
                  <div class="endpoint-item">
                    <span class="endpoint-label">API Gateway</span>
                    <code class="endpoint-value">https://{{ tenant?.domain }}/api</code>
                  </div>
                  <div class="endpoint-item">
                    <span class="endpoint-label">Keycloak Realm</span>
                    <code class="endpoint-value">guce-{{ tenant?.code?.toLowerCase() }}</code>
                  </div>
                  <div class="endpoint-item">
                    <span class="endpoint-label">Database</span>
                    <code class="endpoint-value">guce_{{ tenant?.code?.toLowerCase() }}</code>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-icon class="spinning">sync</mat-icon>
        <p>Chargement de la configuration...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 24px; margin-bottom: 8px; }
    .page-description { color: #757575; margin: 0; }
    .btn-primary {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 24px; background: #1a237e; color: white;
      border: none; border-radius: 8px; font-size: 14px;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #303f9f; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .config-content {
      background: white; border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }

    ::ng-deep .mat-mdc-tab-group { border-radius: 12px; overflow: hidden; }
    ::ng-deep .mat-mdc-tab-header { background: #f5f5f5; }
    ::ng-deep .mat-mdc-tab-body-wrapper { padding: 0; }

    .tab-content { padding: 24px; }

    .config-section {
      margin-bottom: 32px;
      &:last-child { margin-bottom: 0; }
    }
    .config-section h3 {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; margin-bottom: 20px; color: #333;
      padding-bottom: 12px; border-bottom: 1px solid #eee;
    }
    .config-section h3 mat-icon { color: #1a237e; }

    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
    }
    .form-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }

    .color-field {
      display: flex; align-items: flex-start; gap: 12px;
    }
    .color-field mat-form-field { flex: 1; }
    .color-preview {
      width: 56px; height: 56px; border-radius: 8px;
      border: 2px solid #e0e0e0; flex-shrink: 0; margin-top: 4px;
    }

    .branding-preview {
      margin-top: 24px; padding: 20px; background: #fafafa;
      border-radius: 8px; border: 1px solid #e0e0e0;
    }
    .branding-preview h4 { margin: 0 0 16px; font-size: 14px; color: #757575; }
    .preview-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px; border-radius: 8px 8px 0 0; color: white;
    }
    .preview-logo {
      width: 40px; height: 40px; background: rgba(255,255,255,0.2);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-weight: 700;
    }
    .preview-title { font-size: 18px; font-weight: 600; }
    .preview-accent {
      padding: 12px 16px; border-radius: 0 0 8px 8px; color: white;
      font-size: 14px;
    }

    .info-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 12px; color: #9e9e9e; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 500; }

    .endpoints-list { display: flex; flex-direction: column; gap: 12px; }
    .endpoint-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; background: #f5f5f5; border-radius: 8px;
    }
    .endpoint-label { font-size: 13px; color: #757575; }
    .endpoint-value {
      font-family: 'Fira Code', monospace; font-size: 13px;
      color: #1565c0; background: #e3f2fd; padding: 4px 8px;
      border-radius: 4px;
    }

    .loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 100px; color: #757575;
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-grid.cols-3 { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class TenantConfigComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private snackBar = inject(MatSnackBar);

  tenant: Tenant | null = null;
  configForm!: FormGroup;
  loading = true;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.loadTenant();
  }

  private initForm(): void {
    this.configForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      shortName: [''],
      domain: ['', Validators.required],
      country: [''],
      currency: ['XAF'],
      timezone: ['Africa/Douala'],
      locale: ['fr-CM'],
      primaryColor: ['#1a237e'],
      secondaryColor: ['#ff5722'],
      accentColor: ['#ffc107']
    });
  }

  private loadTenant(): void {
    const tenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (!tenantId) return;

    this.tenantService.getById(tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.populateForm(tenant);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private populateForm(tenant: Tenant): void {
    this.configForm.patchValue({
      code: tenant.code,
      name: tenant.name,
      shortName: tenant.shortName,
      domain: tenant.domain,
      country: tenant.country,
      currency: tenant.currency,
      timezone: tenant.timezone,
      locale: tenant.locale,
      primaryColor: tenant.primaryColor || '#1a237e',
      secondaryColor: tenant.secondaryColor || '#ff5722',
      accentColor: '#ffc107'
    });
    this.configForm.markAsPristine();
  }

  saveConfig(): void {
    if (!this.tenant || !this.configForm.valid) return;

    this.saving = true;
    const updates = this.configForm.value;

    this.tenantService.update(this.tenant.id, updates).subscribe({
      next: (updated) => {
        this.tenant = updated;
        this.saving = false;
        this.configForm.markAsPristine();
        this.snackBar.open('Configuration mise a jour', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }
}
