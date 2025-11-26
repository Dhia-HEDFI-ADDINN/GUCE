import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'guce-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule, MatChipsModule],
  template: `
    <div class="role-list">
      <div class="page-header">
        <h1>Rôles & Permissions</h1>
        <button mat-flat-button color="primary" routerLink="/admin/roles/new">
          <mat-icon>add</mat-icon> Nouveau rôle
        </button>
      </div>

      <div class="roles-grid">
        <mat-card class="role-card" *ngFor="let role of roles" [class.system]="role.system">
          <div class="role-header">
            <div class="role-icon" [style.background]="role.color">
              <mat-icon>{{ role.icon }}</mat-icon>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="menu" *ngIf="!role.system">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item [routerLink]="['/admin/roles', role.id, 'edit']">
                <mat-icon>edit</mat-icon> Modifier
              </button>
              <button mat-menu-item [routerLink]="['/admin/roles', role.id, 'permissions']">
                <mat-icon>security</mat-icon> Permissions
              </button>
              <button mat-menu-item>
                <mat-icon>content_copy</mat-icon> Dupliquer
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item class="warn">
                <mat-icon>delete</mat-icon> Supprimer
              </button>
            </mat-menu>
          </div>

          <h3>{{ role.name }}</h3>
          <p class="description">{{ role.description }}</p>

          <div class="role-stats">
            <div class="stat">
              <span class="value">{{ role.usersCount }}</span>
              <span class="label">utilisateurs</span>
            </div>
            <div class="stat">
              <span class="value">{{ role.permissionsCount }}</span>
              <span class="label">permissions</span>
            </div>
          </div>

          <div class="role-tags">
            <mat-chip *ngIf="role.system" class="system-chip">Système</mat-chip>
            <mat-chip *ngFor="let scope of role.scopes" class="scope-chip">{{ scope }}</mat-chip>
          </div>

          <div class="role-actions">
            <button mat-stroked-button [routerLink]="['/admin/roles', role.id, 'permissions']">
              Voir les permissions
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .role-list { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .role-card { padding: 24px; &.system { border-left: 4px solid #1976d2; } .role-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; .role-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; mat-icon { color: white; } } } h3 { margin: 0 0 8px; } .description { color: #757575; margin: 0 0 16px; font-size: 14px; min-height: 40px; } .role-stats { display: flex; gap: 24px; margin-bottom: 16px; .stat { .value { font-size: 20px; font-weight: 600; display: block; } .label { font-size: 12px; color: #757575; } } } .role-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; .system-chip { background: #e3f2fd; color: #1976d2; } .scope-chip { background: #f5f5f5; } } .role-actions { button { width: 100%; } } }
    .warn { color: #f44336; }
  `]
})
export class RoleListComponent {
  roles = [
    {
      id: '1', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités de l\'instance',
      icon: 'admin_panel_settings', color: '#1976d2', usersCount: 3, permissionsCount: 45,
      system: true, scopes: ['Admin']
    },
    {
      id: '2', name: 'Opérateur Économique', description: 'Création et suivi des déclarations import/export',
      icon: 'business_center', color: '#4caf50', usersCount: 856, permissionsCount: 18,
      system: true, scopes: ['e-Force']
    },
    {
      id: '3', name: 'Validateur Douanes', description: 'Validation et traitement des dossiers douaniers',
      icon: 'verified_user', color: '#ff9800', usersCount: 45, permissionsCount: 22,
      system: true, scopes: ['e-Gov']
    },
    {
      id: '4', name: 'Agent MINCOMMERCE', description: 'Traitement des demandes commerciales',
      icon: 'assignment_ind', color: '#9c27b0', usersCount: 28, permissionsCount: 15,
      system: false, scopes: ['e-Gov']
    },
    {
      id: '5', name: 'Transitaire', description: 'Gestion des opérations pour le compte de clients',
      icon: 'local_shipping', color: '#00bcd4', usersCount: 234, permissionsCount: 20,
      system: false, scopes: ['e-Business']
    },
    {
      id: '6', name: 'Superviseur', description: 'Supervision et reporting des activités',
      icon: 'supervisor_account', color: '#607d8b', usersCount: 12, permissionsCount: 25,
      system: false, scopes: ['e-Gov', 'Reports']
    }
  ];
}
