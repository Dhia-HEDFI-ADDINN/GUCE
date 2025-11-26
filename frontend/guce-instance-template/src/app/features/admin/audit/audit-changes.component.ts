import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-audit-changes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatExpansionModule
  ],
  template: `
    <div class="audit-changes">
      <div class="page-header">
        <h1>Journal des modifications</h1>
        <button mat-stroked-button>
          <mat-icon>download</mat-icon> Exporter
        </button>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Entité, utilisateur...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type d'entité</mat-label>
            <mat-select [(ngModel)]="filterEntity">
              <mat-option value="">Tous</mat-option>
              <mat-option value="user">Utilisateurs</mat-option>
              <mat-option value="role">Rôles</mat-option>
              <mat-option value="organization">Organisations</mat-option>
              <mat-option value="procedure">Procédures</mat-option>
              <mat-option value="settings">Paramètres</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de modification</mat-label>
            <mat-select [(ngModel)]="filterChange">
              <mat-option value="">Tous</mat-option>
              <mat-option value="create">Création</mat-option>
              <mat-option value="update">Modification</mat-option>
              <mat-option value="delete">Suppression</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="changes-card">
        <mat-accordion>
          <mat-expansion-panel *ngFor="let change of changes">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon [class]="change.changeType">{{ getChangeIcon(change.changeType) }}</mat-icon>
                <span class="entity-type">{{ change.entityType }}</span>
                <span class="entity-name">{{ change.entityName }}</span>
              </mat-panel-title>
              <mat-panel-description>
                <span class="user">{{ change.userName }}</span>
                <span class="timestamp">{{ change.timestamp }}</span>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="change-details">
              <div class="change-meta">
                <div class="meta-item">
                  <span class="label">ID de l'entité:</span>
                  <span>{{ change.entityId }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Utilisateur:</span>
                  <span>{{ change.userName }} ({{ change.userEmail }})</span>
                </div>
                <div class="meta-item">
                  <span class="label">Adresse IP:</span>
                  <span>{{ change.ipAddress }}</span>
                </div>
              </div>

              <div class="fields-changed" *ngIf="change.fieldsChanged?.length">
                <h4>Champs modifiés</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Champ</th>
                      <th>Ancienne valeur</th>
                      <th>Nouvelle valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let field of change.fieldsChanged">
                      <td>{{ field.name }}</td>
                      <td class="old-value">{{ field.oldValue || '-' }}</td>
                      <td class="new-value">{{ field.newValue || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>

        <mat-paginator [pageSizeOptions]="[25, 50, 100]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-changes { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .filters-card { padding: 16px; margin-bottom: 24px; .filters-row { display: flex; gap: 16px; mat-form-field { width: 250px; } } }
    .changes-card { padding: 0; }
    mat-expansion-panel-header { mat-panel-title { display: flex; align-items: center; gap: 12px; mat-icon { font-size: 20px; width: 20px; height: 20px; &.create { color: #4caf50; } &.update { color: #2196f3; } &.delete { color: #f44336; } } .entity-type { color: #757575; font-size: 12px; text-transform: uppercase; } .entity-name { font-weight: 500; } } mat-panel-description { display: flex; gap: 24px; .user { color: #424242; } .timestamp { color: #757575; } } }
    .change-details { padding: 16px 0; .change-meta { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 24px; .meta-item { .label { color: #757575; margin-right: 8px; } } } .fields-changed { h4 { margin: 0 0 12px; } table { width: 100%; border-collapse: collapse; th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; } th { background: #f5f5f5; font-weight: 500; } .old-value { color: #f44336; text-decoration: line-through; } .new-value { color: #4caf50; } } } }
  `]
})
export class AuditChangesComponent {
  searchQuery = '';
  filterEntity = '';
  filterChange = '';

  changes = [
    {
      changeType: 'update', entityType: 'Utilisateur', entityName: 'Jean Dupont', entityId: 'USR-001234',
      userName: 'Admin System', userEmail: 'admin@guce.gov', timestamp: '2024-01-15 10:30:00', ipAddress: '10.0.0.1',
      fieldsChanged: [
        { name: 'role', oldValue: 'Opérateur', newValue: 'Superviseur' },
        { name: 'active', oldValue: 'true', newValue: 'false' }
      ]
    },
    {
      changeType: 'create', entityType: 'Organisation', entityName: 'New Trading SARL', entityId: 'ORG-005678',
      userName: 'Marie Claire', userEmail: 'marie@admin.gov', timestamp: '2024-01-15 09:15:00', ipAddress: '192.168.1.50',
      fieldsChanged: [
        { name: 'name', oldValue: null, newValue: 'New Trading SARL' },
        { name: 'niu', oldValue: null, newValue: 'M123456789A' },
        { name: 'type', oldValue: null, newValue: 'Importateur' }
      ]
    },
    {
      changeType: 'update', entityType: 'Rôle', entityName: 'Validateur Douanes', entityId: 'ROLE-003',
      userName: 'Admin System', userEmail: 'admin@guce.gov', timestamp: '2024-01-14 16:45:00', ipAddress: '10.0.0.1',
      fieldsChanged: [
        { name: 'permissions.decl.approve', oldValue: 'false', newValue: 'true' },
        { name: 'permissions.decl.reject', oldValue: 'false', newValue: 'true' }
      ]
    },
    {
      changeType: 'delete', entityType: 'Utilisateur', entityName: 'Test User', entityId: 'USR-009999',
      userName: 'Admin System', userEmail: 'admin@guce.gov', timestamp: '2024-01-14 14:00:00', ipAddress: '10.0.0.1',
      fieldsChanged: []
    }
  ];

  getChangeIcon(type: string): string {
    const icons: Record<string, string> = { create: 'add_circle', update: 'edit', delete: 'delete' };
    return icons[type] || 'info';
  }
}
