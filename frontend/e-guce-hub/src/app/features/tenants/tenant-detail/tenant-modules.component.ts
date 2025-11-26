import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TenantService } from '@core/services/tenant.service';
import { Tenant, TenantModule } from '@core/models/tenant.model';

interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'business' | 'tools';
  features: string[];
}

@Component({
  selector: 'hub-tenant-modules',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Modules</h1>
          <p class="page-description">Gerez les modules actifs pour {{ tenant?.name }}</p>
        </div>
        <button class="btn-primary" (click)="saveModules()" [disabled]="!hasChanges || saving">
          <mat-icon>{{ saving ? 'sync' : 'save' }}</mat-icon>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>

      <div class="modules-grid" *ngIf="!loading">
        <!-- Core Modules -->
        <div class="module-section">
          <h2><mat-icon>hub</mat-icon> Modules Principaux</h2>
          <div class="modules-list">
            <div class="module-card" *ngFor="let module of getCoreModules()" [class.enabled]="isModuleEnabled(module.id)">
              <div class="module-header">
                <div class="module-icon" [class.enabled]="isModuleEnabled(module.id)">
                  <mat-icon>{{ module.icon }}</mat-icon>
                </div>
                <div class="module-info">
                  <h3>{{ module.name }}</h3>
                  <p>{{ module.description }}</p>
                </div>
                <mat-slide-toggle
                  [checked]="isModuleEnabled(module.id)"
                  (change)="toggleModule(module.id, $event.checked)"
                  color="primary">
                </mat-slide-toggle>
              </div>
              <div class="module-features" *ngIf="isModuleEnabled(module.id)">
                <span class="feature-badge" *ngFor="let feature of module.features">{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Modules -->
        <div class="module-section">
          <h2><mat-icon>business</mat-icon> Modules Metier</h2>
          <div class="modules-list">
            <div class="module-card" *ngFor="let module of getBusinessModules()" [class.enabled]="isModuleEnabled(module.id)">
              <div class="module-header">
                <div class="module-icon" [class.enabled]="isModuleEnabled(module.id)">
                  <mat-icon>{{ module.icon }}</mat-icon>
                </div>
                <div class="module-info">
                  <h3>{{ module.name }}</h3>
                  <p>{{ module.description }}</p>
                </div>
                <mat-slide-toggle
                  [checked]="isModuleEnabled(module.id)"
                  (change)="toggleModule(module.id, $event.checked)"
                  color="primary">
                </mat-slide-toggle>
              </div>
              <div class="module-features" *ngIf="isModuleEnabled(module.id)">
                <span class="feature-badge" *ngFor="let feature of module.features">{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tools Modules -->
        <div class="module-section">
          <h2><mat-icon>build</mat-icon> Outils Integres</h2>
          <div class="modules-list">
            <div class="module-card" *ngFor="let module of getToolsModules()" [class.enabled]="isModuleEnabled(module.id)">
              <div class="module-header">
                <div class="module-icon" [class.enabled]="isModuleEnabled(module.id)">
                  <mat-icon>{{ module.icon }}</mat-icon>
                </div>
                <div class="module-info">
                  <h3>{{ module.name }}</h3>
                  <p>{{ module.description }}</p>
                </div>
                <mat-slide-toggle
                  [checked]="isModuleEnabled(module.id)"
                  (change)="toggleModule(module.id, $event.checked)"
                  color="primary">
                </mat-slide-toggle>
              </div>
              <div class="module-features" *ngIf="isModuleEnabled(module.id)">
                <span class="feature-badge" *ngFor="let feature of module.features">{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-icon class="spinning">sync</mat-icon>
        <p>Chargement des modules...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px;
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

    .modules-grid { display: flex; flex-direction: column; gap: 32px; }

    .module-section h2 {
      display: flex; align-items: center; gap: 8px;
      font-size: 18px; margin-bottom: 16px; color: #333;
    }
    .module-section h2 mat-icon { color: #1a237e; }

    .modules-list {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
    }

    .module-card {
      background: white; border-radius: 12px;
      padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      border: 2px solid transparent; transition: all 0.2s;
    }
    .module-card.enabled { border-color: #1a237e; }
    .module-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

    .module-header { display: flex; align-items: flex-start; gap: 16px; }

    .module-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      background: #f5f5f5; color: #9e9e9e; flex-shrink: 0;
    }
    .module-icon.enabled { background: #e8eaf6; color: #1a237e; }

    .module-info { flex: 1; }
    .module-info h3 { font-size: 16px; margin: 0 0 4px; }
    .module-info p { font-size: 13px; color: #757575; margin: 0; }

    .module-features {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid #f5f5f5;
    }
    .feature-badge {
      padding: 4px 10px; background: #e3f2fd; color: #1565c0;
      border-radius: 12px; font-size: 11px; font-weight: 500;
    }

    .loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 100px; color: #757575;
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .modules-list { grid-template-columns: 1fr; }
    }
  `]
})
export class TenantModulesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tenantService = inject(TenantService);
  private snackBar = inject(MatSnackBar);

  tenant: Tenant | null = null;
  loading = true;
  saving = false;
  hasChanges = false;

  // Module state
  moduleStates: Map<string, boolean> = new Map();
  originalStates: Map<string, boolean> = new Map();

  // Available modules definitions
  availableModules: ModuleDefinition[] = [
    // Core modules
    {
      id: 'e-force',
      name: 'e-Force',
      description: 'Gestion du commerce exterieur et des operations douanieres',
      icon: 'business_center',
      category: 'core',
      features: ['Import/Export', 'Declarations', 'Manifestes', 'Titres Transport']
    },
    {
      id: 'e-gov',
      name: 'e-Gov',
      description: 'Plateforme de collaboration inter-administrations',
      icon: 'account_balance',
      category: 'core',
      features: ['Workflow', 'Notifications', 'Rapports', 'Signatures']
    },
    {
      id: 'e-business',
      name: 'e-Business',
      description: 'Portail des operateurs economiques',
      icon: 'storefront',
      category: 'core',
      features: ['Profil OE', 'Suivi Dossiers', 'Documents', 'Historique']
    },
    {
      id: 'e-payment',
      name: 'e-Payment',
      description: 'Integration des systemes de paiement',
      icon: 'payment',
      category: 'core',
      features: ['Mobile Money', 'Virement', 'Carte', 'Reconciliation']
    },
    // Business modules
    {
      id: 'procedure-builder',
      name: 'Procedure Builder',
      description: 'Conception et gestion des procedures administratives',
      icon: 'build',
      category: 'business',
      features: ['BPMN Designer', 'Formulaires', 'Regles', 'Simulations']
    },
    {
      id: 'admin-local',
      name: 'Admin Local',
      description: 'Administration locale de l\'instance',
      icon: 'admin_panel_settings',
      category: 'business',
      features: ['Utilisateurs', 'Roles', 'Parametres', 'Audit']
    },
    // Tools modules
    {
      id: 'form-designer',
      name: 'Form Designer',
      description: 'Outil de conception de formulaires dynamiques',
      icon: 'dynamic_form',
      category: 'tools',
      features: ['Drag & Drop', 'Validation', 'Conditionnels']
    },
    {
      id: 'workflow-designer',
      name: 'Workflow Designer',
      description: 'Editeur visuel de workflows BPMN',
      icon: 'account_tree',
      category: 'tools',
      features: ['BPMN 2.0', 'DMN', 'Simulation']
    },
    {
      id: 'rules-engine',
      name: 'Rules Engine',
      description: 'Moteur de regles metier',
      icon: 'rule',
      category: 'tools',
      features: ['Decision Tables', 'Scripts', 'Test']
    },
    {
      id: 'fee-calculator',
      name: 'Fee Calculator',
      description: 'Calculateur de droits et taxes',
      icon: 'calculate',
      category: 'tools',
      features: ['Formules', 'Bareme', 'Export']
    }
  ];

  ngOnInit(): void {
    this.loadTenant();
  }

  private loadTenant(): void {
    const tenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (!tenantId) return;

    this.tenantService.getById(tenantId).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.initializeModuleStates();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private initializeModuleStates(): void {
    this.moduleStates.clear();
    this.originalStates.clear();

    // Initialize all modules as disabled
    this.availableModules.forEach(m => {
      this.moduleStates.set(m.id, false);
      this.originalStates.set(m.id, false);
    });

    // Set enabled modules from tenant
    this.tenant?.modules?.forEach(m => {
      const moduleId = m.name.toLowerCase().replace(' ', '-');
      if (m.enabled) {
        this.moduleStates.set(moduleId, true);
        this.originalStates.set(moduleId, true);
      }
    });
  }

  getCoreModules(): ModuleDefinition[] {
    return this.availableModules.filter(m => m.category === 'core');
  }

  getBusinessModules(): ModuleDefinition[] {
    return this.availableModules.filter(m => m.category === 'business');
  }

  getToolsModules(): ModuleDefinition[] {
    return this.availableModules.filter(m => m.category === 'tools');
  }

  isModuleEnabled(moduleId: string): boolean {
    return this.moduleStates.get(moduleId) || false;
  }

  toggleModule(moduleId: string, enabled: boolean): void {
    this.moduleStates.set(moduleId, enabled);
    this.checkForChanges();
  }

  private checkForChanges(): void {
    this.hasChanges = false;
    this.moduleStates.forEach((value, key) => {
      if (value !== this.originalStates.get(key)) {
        this.hasChanges = true;
      }
    });
  }

  saveModules(): void {
    if (!this.tenant || !this.hasChanges) return;

    this.saving = true;

    const modules: Partial<TenantModule>[] = [];
    this.moduleStates.forEach((enabled, id) => {
      const moduleDef = this.availableModules.find(m => m.id === id);
      if (moduleDef) {
        modules.push({
          name: id,
          enabled: enabled,
          features: enabled ? moduleDef.features : []
        });
      }
    });

    this.tenantService.updateModules(this.tenant.id, { modules }).subscribe({
      next: () => {
        this.saving = false;
        this.hasChanges = false;
        this.originalStates = new Map(this.moduleStates);
        this.snackBar.open('Modules mis a jour avec succes', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise a jour', 'Fermer', { duration: 3000 });
      }
    });
  }
}
