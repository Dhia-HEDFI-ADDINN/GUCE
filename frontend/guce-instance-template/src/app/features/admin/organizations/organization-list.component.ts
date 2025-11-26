import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-organization-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatMenuModule, MatTabsModule
  ],
  template: `
    <div class="organization-list">
      <div class="page-header">
        <h1>Organisations</h1>
        <div class="header-actions">
          <button mat-stroked-button>
            <mat-icon>upload</mat-icon> Importer
          </button>
          <button mat-flat-button color="primary" routerLink="/admin/organizations/new">
            <mat-icon>add_business</mat-icon> Nouvelle organisation
          </button>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Entreprises ({{ stats.enterprises }})">
          <ng-template matTabContent>
            <mat-card class="filters-card">
              <div class="filters-row">
                <mat-form-field appearance="outline">
                  <mat-label>Rechercher</mat-label>
                  <input matInput [(ngModel)]="searchQuery" placeholder="Nom, NIU, RCCM...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select [(ngModel)]="filterStatus">
                    <mat-option value="">Tous</mat-option>
                    <mat-option value="active">Actif</mat-option>
                    <mat-option value="suspended">Suspendu</mat-option>
                    <mat-option value="pending">En attente</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select [(ngModel)]="filterType">
                    <mat-option value="">Tous</mat-option>
                    <mat-option value="importer">Importateur</mat-option>
                    <mat-option value="exporter">Exportateur</mat-option>
                    <mat-option value="transit">Transitaire</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card>

            <mat-card class="table-card">
              <table mat-table [dataSource]="enterprises" matSort>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Raison sociale</th>
                  <td mat-cell *matCellDef="let org">
                    <div class="org-info">
                      <span class="name">{{ org.name }}</span>
                      <span class="niu">NIU: {{ org.niu }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                  <td mat-cell *matCellDef="let org">
                    <mat-chip>{{ org.type }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="users">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateurs</th>
                  <td mat-cell *matCellDef="let org">{{ org.usersCount }}</td>
                </ng-container>

                <ng-container matColumnDef="declarations">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Déclarations</th>
                  <td mat-cell *matCellDef="let org">{{ org.declarationsCount }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                  <td mat-cell *matCellDef="let org">
                    <span class="status-badge" [class]="org.status">{{ getStatusLabel(org.status) }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let org">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item [routerLink]="['/admin/organizations', org.id]">
                        <mat-icon>visibility</mat-icon> Voir
                      </button>
                      <button mat-menu-item>
                        <mat-icon>edit</mat-icon> Modifier
                      </button>
                      <button mat-menu-item>
                        <mat-icon>people</mat-icon> Utilisateurs
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item class="warn">
                        <mat-icon>block</mat-icon> Suspendre
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <mat-paginator [pageSizeOptions]="[25, 50, 100]" showFirstLastButtons></mat-paginator>
            </mat-card>
          </ng-template>
        </mat-tab>

        <mat-tab label="Administrations ({{ stats.administrations }})">
          <ng-template matTabContent>
            <mat-card class="table-card">
              <table mat-table [dataSource]="administrations">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Administration</th>
                  <td mat-cell *matCellDef="let org">
                    <div class="org-info">
                      <span class="name">{{ org.name }}</span>
                      <span class="code">{{ org.code }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="ministry">
                  <th mat-header-cell *matHeaderCellDef>Ministère</th>
                  <td mat-cell *matCellDef="let org">{{ org.ministry }}</td>
                </ng-container>

                <ng-container matColumnDef="users">
                  <th mat-header-cell *matHeaderCellDef>Agents</th>
                  <td mat-cell *matCellDef="let org">{{ org.usersCount }}</td>
                </ng-container>

                <ng-container matColumnDef="procedures">
                  <th mat-header-cell *matHeaderCellDef>Procédures</th>
                  <td mat-cell *matCellDef="let org">{{ org.proceduresCount }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let org">
                    <button mat-icon-button [routerLink]="['/admin/organizations', org.id]">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="adminColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: adminColumns;"></tr>
              </table>
            </mat-card>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .organization-list { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } .header-actions { display: flex; gap: 12px; } }
    .filters-card { padding: 16px; margin: 24px 0; .filters-row { display: flex; gap: 16px; mat-form-field { width: 250px; } } }
    .table-card { overflow: hidden; margin-top: 24px; table { width: 100%; } }
    .org-info { display: flex; flex-direction: column; .name { font-weight: 500; } .niu, .code { font-size: 12px; color: #757575; } }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; &.active { background: #e8f5e9; color: #2e7d32; } &.suspended { background: #ffebee; color: #c62828; } &.pending { background: #fff3e0; color: #ef6c00; } }
    .warn { color: #f44336; }
  `]
})
export class OrganizationListComponent {
  searchQuery = '';
  filterStatus = '';
  filterType = '';

  displayedColumns = ['name', 'type', 'users', 'declarations', 'status', 'actions'];
  adminColumns = ['name', 'ministry', 'users', 'procedures', 'actions'];

  stats = {
    enterprises: 356,
    administrations: 12
  };

  enterprises = [
    { id: '1', name: 'Import Export SARL', niu: 'M012345678901A', type: 'Importateur', usersCount: 8, declarationsCount: 156, status: 'active' },
    { id: '2', name: 'Transit Pro', niu: 'M023456789012B', type: 'Transitaire', usersCount: 15, declarationsCount: 432, status: 'active' },
    { id: '3', name: 'Commerce Global', niu: 'M034567890123C', type: 'Importateur', usersCount: 5, declarationsCount: 89, status: 'suspended' },
    { id: '4', name: 'Africa Trading', niu: 'M045678901234D', type: 'Exportateur', usersCount: 3, declarationsCount: 67, status: 'active' },
    { id: '5', name: 'New Company SARL', niu: 'M056789012345E', type: 'Importateur', usersCount: 1, declarationsCount: 0, status: 'pending' }
  ];

  administrations = [
    { id: 'a1', name: 'Direction Générale des Douanes', code: 'DGD', ministry: 'MINFI', usersCount: 245, proceduresCount: 8 },
    { id: 'a2', name: 'Direction du Commerce', code: 'MINCOMMERCE', ministry: 'MINCOMMERCE', usersCount: 56, proceduresCount: 5 },
    { id: 'a3', name: 'Service Phytosanitaire', code: 'MINADER', ministry: 'MINADER', usersCount: 23, proceduresCount: 3 },
    { id: 'a4', name: 'Autorité Portuaire Nationale', code: 'APN', ministry: 'MINTRANS', usersCount: 34, proceduresCount: 2 }
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Actif', suspended: 'Suspendu', pending: 'En attente' };
    return labels[status] || status;
  }
}
