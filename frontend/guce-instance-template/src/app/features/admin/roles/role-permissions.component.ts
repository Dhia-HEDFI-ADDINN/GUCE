import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-role-permissions',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatCheckboxModule,
    MatExpansionModule, MatChipsModule
  ],
  template: `
    <div class="role-permissions">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/roles">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Permissions: {{ role.name }}</h1>
          <mat-chip class="scope-chip" *ngFor="let scope of role.scopes">{{ scope }}</mat-chip>
        </div>
        <button mat-flat-button color="primary" (click)="savePermissions()">
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </div>

      <div class="permissions-layout">
        <mat-card class="modules-card">
          <h3>Modules</h3>
          <div class="module-list">
            <div class="module-item" *ngFor="let module of modules"
                 [class.active]="selectedModule === module.id"
                 (click)="selectModule(module.id)">
              <mat-icon>{{ module.icon }}</mat-icon>
              <span>{{ module.name }}</span>
              <span class="count">{{ getModulePermissionCount(module.id) }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="permissions-card">
          <div class="permissions-header">
            <h3>{{ getModuleName(selectedModule) }}</h3>
            <div class="bulk-actions">
              <button mat-button (click)="selectAll()">Tout sélectionner</button>
              <button mat-button (click)="deselectAll()">Tout désélectionner</button>
            </div>
          </div>

          <mat-accordion>
            <mat-expansion-panel *ngFor="let group of getPermissionGroups(selectedModule)">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  {{ group.name }}
                </mat-panel-title>
                <mat-panel-description>
                  {{ getGroupSelectedCount(group) }} / {{ group.permissions.length }} permissions
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="permissions-list">
                <div class="permission-item" *ngFor="let perm of group.permissions">
                  <mat-checkbox [(ngModel)]="perm.granted">
                    <div class="perm-content">
                      <span class="perm-name">{{ perm.name }}</span>
                      <span class="perm-description">{{ perm.description }}</span>
                    </div>
                  </mat-checkbox>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card>
      </div>

      <mat-card class="summary-card">
        <h3>Résumé des permissions</h3>
        <div class="summary-grid">
          <div class="summary-item" *ngFor="let module of modules">
            <mat-icon>{{ module.icon }}</mat-icon>
            <span class="module-name">{{ module.name }}</span>
            <span class="permission-count">{{ getModulePermissionCount(module.id) }} permissions</span>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .role-permissions { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; .header-content { flex: 1; display: flex; align-items: center; gap: 12px; h1 { margin: 0; } .scope-chip { background: #e3f2fd; } } }
    .permissions-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; margin-bottom: 24px; }
    .modules-card { padding: 16px; h3 { margin: 0 0 16px; font-size: 14px; color: #757575; text-transform: uppercase; } .module-list { .module-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: background 0.2s; mat-icon { color: #757575; } span { flex: 1; } .count { font-size: 12px; color: #757575; background: #f5f5f5; padding: 2px 8px; border-radius: 12px; } &:hover { background: #f5f5f5; } &.active { background: #e3f2fd; mat-icon { color: #1976d2; } } } } }
    .permissions-card { padding: 24px; .permissions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; } .bulk-actions { display: flex; gap: 8px; } } .permissions-list { .permission-item { padding: 12px 0; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; } .perm-content { display: flex; flex-direction: column; .perm-name { font-weight: 500; } .perm-description { font-size: 12px; color: #757575; margin-top: 2px; } } } } }
    .summary-card { padding: 24px; h3 { margin: 0 0 16px; } .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; .summary-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f5f5f5; border-radius: 8px; mat-icon { color: #1976d2; } .module-name { flex: 1; font-weight: 500; } .permission-count { font-size: 12px; color: #757575; } } } }
    @media (max-width: 1024px) { .permissions-layout { grid-template-columns: 1fr; } }
  `]
})
export class RolePermissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  roleId = '';
  selectedModule = 'declarations';

  role = {
    id: '3',
    name: 'Validateur Douanes',
    scopes: ['e-Gov']
  };

  modules = [
    { id: 'declarations', name: 'Déclarations', icon: 'description' },
    { id: 'documents', name: 'Documents', icon: 'folder' },
    { id: 'payments', name: 'Paiements', icon: 'payments' },
    { id: 'users', name: 'Utilisateurs', icon: 'people' },
    { id: 'reports', name: 'Rapports', icon: 'assessment' },
    { id: 'settings', name: 'Paramètres', icon: 'settings' }
  ];

  permissionGroups: Record<string, any[]> = {
    declarations: [
      {
        name: 'Consultation',
        permissions: [
          { id: 'decl.view', name: 'Voir les déclarations', description: 'Consulter la liste et le détail des déclarations', granted: true },
          { id: 'decl.view.all', name: 'Voir toutes les déclarations', description: 'Inclut les déclarations d\'autres services', granted: true },
          { id: 'decl.export', name: 'Exporter les déclarations', description: 'Télécharger au format CSV/Excel', granted: true }
        ]
      },
      {
        name: 'Traitement',
        permissions: [
          { id: 'decl.process', name: 'Traiter les déclarations', description: 'Valider ou rejeter les déclarations', granted: true },
          { id: 'decl.assign', name: 'Assigner les déclarations', description: 'Réassigner à un autre agent', granted: false },
          { id: 'decl.comment', name: 'Ajouter des commentaires', description: 'Commenter les dossiers', granted: true }
        ]
      },
      {
        name: 'Décisions',
        permissions: [
          { id: 'decl.approve', name: 'Approuver', description: 'Valider définitivement une déclaration', granted: true },
          { id: 'decl.reject', name: 'Rejeter', description: 'Refuser une déclaration', granted: true },
          { id: 'decl.suspend', name: 'Suspendre', description: 'Mettre en attente pour complément', granted: true }
        ]
      }
    ],
    documents: [
      {
        name: 'Gestion',
        permissions: [
          { id: 'doc.view', name: 'Consulter les documents', description: 'Voir les pièces jointes', granted: true },
          { id: 'doc.download', name: 'Télécharger', description: 'Télécharger les documents', granted: true },
          { id: 'doc.validate', name: 'Valider les documents', description: 'Marquer comme conforme', granted: true }
        ]
      }
    ],
    payments: [
      {
        name: 'Consultation',
        permissions: [
          { id: 'pay.view', name: 'Voir les paiements', description: 'Consulter l\'historique des paiements', granted: true }
        ]
      }
    ],
    users: [
      {
        name: 'Gestion',
        permissions: [
          { id: 'user.view', name: 'Voir les utilisateurs', description: 'Liste des utilisateurs du service', granted: false }
        ]
      }
    ],
    reports: [
      {
        name: 'Rapports',
        permissions: [
          { id: 'report.view', name: 'Consulter les rapports', description: 'Accéder aux tableaux de bord', granted: true },
          { id: 'report.export', name: 'Exporter les rapports', description: 'Télécharger les statistiques', granted: true }
        ]
      }
    ],
    settings: [
      {
        name: 'Configuration',
        permissions: [
          { id: 'settings.view', name: 'Voir les paramètres', description: 'Consulter la configuration', granted: false }
        ]
      }
    ]
  };

  ngOnInit(): void {
    this.roleId = this.route.snapshot.params['id'];
  }

  selectModule(moduleId: string): void {
    this.selectedModule = moduleId;
  }

  getModuleName(moduleId: string): string {
    return this.modules.find(m => m.id === moduleId)?.name || '';
  }

  getPermissionGroups(moduleId: string): any[] {
    return this.permissionGroups[moduleId] || [];
  }

  getModulePermissionCount(moduleId: string): number {
    const groups = this.permissionGroups[moduleId] || [];
    return groups.reduce((total, group) => {
      return total + group.permissions.filter((p: any) => p.granted).length;
    }, 0);
  }

  getGroupSelectedCount(group: any): number {
    return group.permissions.filter((p: any) => p.granted).length;
  }

  selectAll(): void {
    const groups = this.getPermissionGroups(this.selectedModule);
    groups.forEach(group => {
      group.permissions.forEach((p: any) => p.granted = true);
    });
  }

  deselectAll(): void {
    const groups = this.getPermissionGroups(this.selectedModule);
    groups.forEach(group => {
      group.permissions.forEach((p: any) => p.granted = false);
    });
  }

  savePermissions(): void {
    console.log('Saving permissions...');
  }
}
