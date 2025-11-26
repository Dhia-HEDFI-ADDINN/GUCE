import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

interface Declaration {
  id: string;
  reference: string;
  type: string;
  goods: string;
  value: number;
  currency: string;
  status: string;
  declarant: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'guce-declaration-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatMenuModule, MatTooltipModule
  ],
  template: `
    <div class="declaration-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>{{ getTypeLabel() }}</h1>
          <p>Gérez vos déclarations {{ type }}</p>
        </div>
        <button mat-flat-button color="primary" [routerLink]="['/e-force/declarations/new', type]">
          <mat-icon>add</mat-icon>
          Nouvelle déclaration
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Référence, marchandise..." (input)="applyFilters()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
              <mat-option value="">Tous</mat-option>
              <mat-option value="draft">Brouillon</mat-option>
              <mat-option value="submitted">Soumise</mat-option>
              <mat-option value="processing">En cours</mat-option>
              <mat-option value="approved">Approuvée</mat-option>
              <mat-option value="rejected">Rejetée</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="periodFilter" (selectionChange)="applyFilters()">
              <mat-option value="">Toutes</mat-option>
              <mat-option value="today">Aujourd'hui</mat-option>
              <mat-option value="week">Cette semaine</mat-option>
              <mat-option value="month">Ce mois</mat-option>
              <mat-option value="year">Cette année</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Effacer
          </button>
        </div>
      </mat-card>

      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item draft">
          <span class="stat-value">{{ stats.draft }}</span>
          <span class="stat-label">Brouillons</span>
        </div>
        <div class="stat-item submitted">
          <span class="stat-value">{{ stats.submitted }}</span>
          <span class="stat-label">Soumises</span>
        </div>
        <div class="stat-item processing">
          <span class="stat-value">{{ stats.processing }}</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat-item approved">
          <span class="stat-value">{{ stats.approved }}</span>
          <span class="stat-label">Approuvées</span>
        </div>
        <div class="stat-item rejected">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">Rejetées</span>
        </div>
      </div>

      <!-- Table -->
      <mat-card class="table-card">
        <table mat-table [dataSource]="filteredDeclarations" matSort (matSortChange)="sortData($event)">
          <!-- Reference Column -->
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Référence</th>
            <td mat-cell *matCellDef="let decl">
              <a [routerLink]="['/e-force/declarations', decl.id]" class="ref-link">
                {{ decl.reference }}
              </a>
            </td>
          </ng-container>

          <!-- Goods Column -->
          <ng-container matColumnDef="goods">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Marchandises</th>
            <td mat-cell *matCellDef="let decl">{{ decl.goods }}</td>
          </ng-container>

          <!-- Value Column -->
          <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Valeur</th>
            <td mat-cell *matCellDef="let decl">{{ formatCurrency(decl.value, decl.currency) }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let decl">
              <mat-chip [class]="'status-' + decl.status">
                {{ getStatusLabel(decl.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let decl">{{ decl.createdAt }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let decl">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item [routerLink]="['/e-force/declarations', decl.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item [routerLink]="['/e-force/declarations', decl.id, 'edit']" *ngIf="canEdit(decl)">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item (click)="duplicate(decl)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Dupliquer</span>
                </button>
                <button mat-menu-item (click)="downloadPdf(decl)">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <span>Télécharger PDF</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="delete(decl)" *ngIf="canDelete(decl)" class="delete-action">
                  <mat-icon>delete</mat-icon>
                  <span>Supprimer</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Empty State -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
              <mat-icon>inbox</mat-icon>
              <p>Aucune déclaration trouvée</p>
              <button mat-flat-button color="primary" [routerLink]="['/e-force/declarations/new', type]">
                Créer une déclaration
              </button>
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .declaration-list-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          margin: 4px 0 0;
          color: #757575;
        }
      }
    }

    .filters-card {
      margin-bottom: 24px;
      padding: 16px;

      .filters-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;

        .search-field {
          flex: 1;
          min-width: 250px;
        }

        mat-form-field {
          width: 150px;
        }
      }
    }

    .stats-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;

      .stat-item {
        padding: 16px 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 100px;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 12px;
          color: #757575;
        }

        &.draft .stat-value { color: #616161; }
        &.submitted .stat-value { color: #1565c0; }
        &.processing .stat-value { color: #e65100; }
        &.approved .stat-value { color: #2e7d32; }
        &.rejected .stat-value { color: #c62828; }
      }
    }

    .table-card {
      overflow: hidden;

      table {
        width: 100%;
      }

      .ref-link {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .empty-state {
        text-align: center;
        padding: 48px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #9e9e9e;
        }

        p {
          color: #757575;
          margin: 16px 0;
        }
      }

      .delete-action {
        color: #c62828;
      }
    }

    ::ng-deep {
      .status-draft { background-color: #f5f5f5 !important; color: #616161 !important; }
      .status-submitted { background-color: #e3f2fd !important; color: #1565c0 !important; }
      .status-processing { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-approved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .status-rejected { background-color: #ffebee !important; color: #c62828 !important; }
    }
  `]
})
export class DeclarationListComponent implements OnInit {
  private route = inject(ActivatedRoute);

  type = 'import';
  searchQuery = '';
  statusFilter = '';
  periodFilter = '';

  displayedColumns = ['reference', 'goods', 'value', 'status', 'createdAt', 'actions'];

  declarations: Declaration[] = [];
  filteredDeclarations: Declaration[] = [];

  stats = {
    total: 0,
    draft: 0,
    submitted: 0,
    processing: 0,
    approved: 0,
    rejected: 0
  };

  totalItems = 0;
  pageSize = 25;

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'] || 'import';
      this.loadDeclarations();
    });
  }

  loadDeclarations() {
    // Simulated data - replace with API call
    this.declarations = [
      { id: '1', reference: `${this.type.toUpperCase().substring(0, 3)}-2024-001234`, type: this.type, goods: 'Équipements informatiques', value: 15000000, currency: 'XAF', status: 'processing', declarant: 'SARL Tech Import', createdAt: '10/12/2024', updatedAt: '11/12/2024' },
      { id: '2', reference: `${this.type.toUpperCase().substring(0, 3)}-2024-001233`, type: this.type, goods: 'Pièces automobiles', value: 8500000, currency: 'XAF', status: 'approved', declarant: 'Auto Parts SARL', createdAt: '09/12/2024', updatedAt: '10/12/2024' },
      { id: '3', reference: `${this.type.toUpperCase().substring(0, 3)}-2024-001232`, type: this.type, goods: 'Produits pharmaceutiques', value: 25000000, currency: 'XAF', status: 'submitted', declarant: 'Pharma Plus', createdAt: '08/12/2024', updatedAt: '08/12/2024' },
      { id: '4', reference: `${this.type.toUpperCase().substring(0, 3)}-2024-001231`, type: this.type, goods: 'Matériaux de construction', value: 45000000, currency: 'XAF', status: 'draft', declarant: 'BTP Import', createdAt: '07/12/2024', updatedAt: '07/12/2024' },
      { id: '5', reference: `${this.type.toUpperCase().substring(0, 3)}-2024-001230`, type: this.type, goods: 'Textiles et vêtements', value: 12000000, currency: 'XAF', status: 'rejected', declarant: 'Fashion Import', createdAt: '06/12/2024', updatedAt: '08/12/2024' }
    ];

    this.calculateStats();
    this.applyFilters();
  }

  calculateStats() {
    this.stats.total = this.declarations.length;
    this.stats.draft = this.declarations.filter(d => d.status === 'draft').length;
    this.stats.submitted = this.declarations.filter(d => d.status === 'submitted').length;
    this.stats.processing = this.declarations.filter(d => d.status === 'processing').length;
    this.stats.approved = this.declarations.filter(d => d.status === 'approved').length;
    this.stats.rejected = this.declarations.filter(d => d.status === 'rejected').length;
  }

  applyFilters() {
    this.filteredDeclarations = this.declarations.filter(decl => {
      const matchesSearch = !this.searchQuery ||
        decl.reference.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        decl.goods.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || decl.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    this.totalItems = this.filteredDeclarations.length;
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.periodFilter = '';
    this.applyFilters();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredDeclarations = this.filteredDeclarations.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'reference': return this.compare(a.reference, b.reference, isAsc);
        case 'goods': return this.compare(a.goods, b.goods, isAsc);
        case 'value': return this.compare(a.value, b.value, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        case 'createdAt': return this.compare(a.createdAt, b.createdAt, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
  }

  getTypeLabel(): string {
    const labels: Record<string, string> = {
      import: 'Déclarations d\'importation',
      export: 'Déclarations d\'exportation',
      transit: 'Déclarations de transit'
    };
    return labels[this.type] || 'Déclarations';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumise',
      processing: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  }

  canEdit(decl: Declaration): boolean {
    return ['draft', 'rejected'].includes(decl.status);
  }

  canDelete(decl: Declaration): boolean {
    return decl.status === 'draft';
  }

  duplicate(decl: Declaration) {
    console.log('Duplicate', decl);
  }

  downloadPdf(decl: Declaration) {
    console.log('Download PDF', decl);
  }

  delete(decl: Declaration) {
    console.log('Delete', decl);
  }
}
