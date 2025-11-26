import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-referential-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatInputModule],
  template: `
    <div class="referential-container">
      <div class="page-header">
        <h1>{{ getTitle() }}</h1>
        <button mat-flat-button color="primary"><mat-icon>add</mat-icon> Ajouter</button>
      </div>

      <mat-card class="filters-card">
        <mat-form-field appearance="outline">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" placeholder="Code, libellé...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let item">{{ item.code }}</td>
          </ng-container>

          <ng-container matColumnDef="label">
            <th mat-header-cell *matHeaderCellDef>Libellé</th>
            <td mat-cell *matCellDef="let item">{{ item.label }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let item">
              <button mat-icon-button><mat-icon>edit</mat-icon></button>
              <button mat-icon-button><mat-icon>delete</mat-icon></button>
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
    .referential-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .filters-card { padding: 16px; margin-bottom: 24px; mat-form-field { width: 300px; } }
    .table-card { overflow: hidden; table { width: 100%; } }
  `]
})
export class ReferentialListComponent implements OnInit {
  private route = inject(ActivatedRoute);

  type = '';
  searchQuery = '';
  displayedColumns = ['code', 'label', 'actions'];
  items: any[] = [];

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'] || 'custom';
      this.loadItems();
    });
  }

  loadItems() {
    const data: Record<string, any[]> = {
      countries: [{ code: 'CM', label: 'Cameroun' }, { code: 'FR', label: 'France' }, { code: 'CN', label: 'Chine' }],
      currencies: [{ code: 'XAF', label: 'Franc CFA' }, { code: 'USD', label: 'Dollar US' }, { code: 'EUR', label: 'Euro' }],
      products: [{ code: '8471', label: 'Machines de traitement' }, { code: '8703', label: 'Véhicules' }]
    };
    this.items = data[this.type] || [];
  }

  getTitle(): string {
    const titles: Record<string, string> = { countries: 'Pays', currencies: 'Devises', products: 'Produits' };
    return titles[this.type] || 'Référentiel';
  }
}
