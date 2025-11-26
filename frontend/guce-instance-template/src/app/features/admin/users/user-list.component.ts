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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatMenuModule, MatCheckboxModule
  ],
  template: `
    <div class="user-list">
      <div class="page-header">
        <h1>Utilisateurs</h1>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/admin/users/import">
            <mat-icon>upload</mat-icon> Importer
          </button>
          <button mat-flat-button color="primary" routerLink="/admin/users/new">
            <mat-icon>person_add</mat-icon> Nouvel utilisateur
          </button>
        </div>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Nom, email, organisation...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rôle</mat-label>
            <mat-select [(ngModel)]="filterRole">
              <mat-option value="">Tous</mat-option>
              <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="filterStatus">
              <mat-option value="">Tous</mat-option>
              <mat-option value="active">Actif</mat-option>
              <mat-option value="inactive">Inactif</mat-option>
              <mat-option value="pending">En attente</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-icon-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
          </button>
        </div>

        <div class="bulk-actions" *ngIf="selectedUsers.length > 0">
          <span>{{ selectedUsers.length }} sélectionné(s)</span>
          <button mat-button color="primary">Activer</button>
          <button mat-button color="warn">Désactiver</button>
          <button mat-button>Exporter</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="users" matSort>
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="toggleSelectAll($event.checked)" [checked]="allSelected"></mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let user">
              <mat-checkbox [checked]="isSelected(user)" (change)="toggleSelect(user)"></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
            <td mat-cell *matCellDef="let user">
              <div class="user-info">
                <div class="avatar">{{ user.initials }}</div>
                <div class="user-details">
                  <span class="name">{{ user.name }}</span>
                  <span class="email">{{ user.email }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="organization">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Organisation</th>
            <td mat-cell *matCellDef="let user">{{ user.organization }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôle</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip>{{ user.role }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let user">
              <span class="status-badge" [class]="user.status">
                {{ getStatusLabel(user.status) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="lastLogin">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Dernière connexion</th>
            <td mat-cell *matCellDef="let user">{{ user.lastLogin }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/admin/users', user.id]">
                  <mat-icon>visibility</mat-icon> Voir
                </button>
                <button mat-menu-item [routerLink]="['/admin/users', user.id, 'edit']">
                  <mat-icon>edit</mat-icon> Modifier
                </button>
                <button mat-menu-item>
                  <mat-icon>lock_reset</mat-icon> Réinitialiser mot de passe
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item class="warn">
                  <mat-icon>block</mat-icon> Désactiver
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[25, 50, 100]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-list { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } .header-actions { display: flex; gap: 12px; } }
    .filters-card { padding: 16px; margin-bottom: 24px; .filters-row { display: flex; gap: 16px; align-items: center; mat-form-field { width: 250px; } } .bulk-actions { display: flex; align-items: center; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0; span { font-weight: 500; } } }
    .table-card { overflow: hidden; table { width: 100%; } }
    .user-info { display: flex; align-items: center; gap: 12px; .avatar { width: 36px; height: 36px; border-radius: 50%; background: #1976d2; color: white; display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 14px; } .user-details { display: flex; flex-direction: column; .name { font-weight: 500; } .email { font-size: 12px; color: #757575; } } }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; &.active { background: #e8f5e9; color: #2e7d32; } &.inactive { background: #ffebee; color: #c62828; } &.pending { background: #fff3e0; color: #ef6c00; } }
    .warn { color: #f44336; }
  `]
})
export class UserListComponent {
  searchQuery = '';
  filterRole = '';
  filterStatus = '';
  selectedUsers: any[] = [];
  allSelected = false;

  displayedColumns = ['select', 'name', 'organization', 'role', 'status', 'lastLogin', 'actions'];

  roles = ['Administrateur', 'Opérateur', 'Validateur', 'Agent', 'Superviseur'];

  users = [
    { id: '1', name: 'Jean Dupont', initials: 'JD', email: 'jean.dupont@example.com', organization: 'Import Export SARL', role: 'Opérateur', status: 'active', lastLogin: '2024-01-15 09:30' },
    { id: '2', name: 'Marie Claire', initials: 'MC', email: 'marie.claire@admin.gov', organization: 'Direction des Douanes', role: 'Validateur', status: 'active', lastLogin: '2024-01-15 08:45' },
    { id: '3', name: 'Pierre Martin', initials: 'PM', email: 'pierre.martin@transit.com', organization: 'Transit Pro', role: 'Agent', status: 'inactive', lastLogin: '2024-01-10 14:20' },
    { id: '4', name: 'Sophie Bernard', initials: 'SB', email: 'sophie.bernard@example.com', organization: 'Commerce Global', role: 'Opérateur', status: 'pending', lastLogin: '-' },
    { id: '5', name: 'Admin System', initials: 'AS', email: 'admin@guce.gov', organization: 'GUCE Administration', role: 'Administrateur', status: 'active', lastLogin: '2024-01-15 10:00' }
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Actif', inactive: 'Inactif', pending: 'En attente' };
    return labels[status] || status;
  }

  isSelected(user: any): boolean {
    return this.selectedUsers.includes(user);
  }

  toggleSelect(user: any): void {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
    this.allSelected = this.selectedUsers.length === this.users.length;
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedUsers = checked ? [...this.users] : [];
    this.allSelected = checked;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterStatus = '';
  }
}
