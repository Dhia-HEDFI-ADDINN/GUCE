import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatInputModule, MatMenuModule],
  template: `
    <div class="client-list-container">
      <div class="page-header">
        <h1>Mes clients</h1>
        <button mat-flat-button color="primary" routerLink="/e-business/clients/new">
          <mat-icon>add</mat-icon> Nouveau client
        </button>
      </div>

      <mat-card class="filters-card">
        <mat-form-field appearance="outline">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" placeholder="Nom, N° contribuable...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="clients">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Raison sociale</th>
            <td mat-cell *matCellDef="let c">
              <a [routerLink]="['/e-business/clients', c.id]">{{ c.name }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="taxNumber">
            <th mat-header-cell *matHeaderCellDef>N° Contribuable</th>
            <td mat-cell *matCellDef="let c">{{ c.taxNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact</th>
            <td mat-cell *matCellDef="let c">{{ c.contact }}</td>
          </ng-container>

          <ng-container matColumnDef="declarations">
            <th mat-header-cell *matHeaderCellDef>Déclarations</th>
            <td mat-cell *matCellDef="let c">{{ c.declarationsCount }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/e-business/clients', c.id]">
                  <mat-icon>visibility</mat-icon> Voir
                </button>
                <button mat-menu-item [routerLink]="['/e-business/declarations/new']" [queryParams]="{clientId: c.id}">
                  <mat-icon>add</mat-icon> Nouvelle déclaration
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSize]="25"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .client-list-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .filters-card { padding: 16px; margin-bottom: 24px; mat-form-field { width: 300px; } }
    .table-card { overflow: hidden; table { width: 100%; } a { color: #1976d2; text-decoration: none; &:hover { text-decoration: underline; } } }
  `]
})
export class ClientListComponent {
  searchQuery = '';
  displayedColumns = ['name', 'taxNumber', 'contact', 'declarations', 'actions'];

  clients = [
    { id: '1', name: 'SARL Tech Import', taxNumber: 'M123456789A', contact: 'Jean Dupont', declarationsCount: 12 },
    { id: '2', name: 'Agro Export SA', taxNumber: 'M987654321B', contact: 'Marie Martin', declarationsCount: 8 },
    { id: '3', name: 'Auto Parts SARL', taxNumber: 'M456789123C', contact: 'Pierre Dubois', declarationsCount: 6 }
  ];
}
