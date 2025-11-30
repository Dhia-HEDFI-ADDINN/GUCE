import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil, merge } from 'rxjs';
import { DeclarationService } from '../../../core/services/declaration.service';
import { Declaration, DeclarationStatus, DeclarationType, DeclarationSearchParams } from '../../../core/models/declaration.model';

/**
 * Liste des Déclarations d'Importation
 *
 * Fonctionnalités:
 * - Liste paginée avec tri
 * - Filtres avancés (référence, statut, type, dates)
 * - Actions rapides par ligne
 * - Export des données
 */
@Component({
  selector: 'guce-import-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="import-list">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Déclarations d'Importation</h1>
          <p>{{ totalElements }} dossier(s) trouvé(s)</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportData()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-flat-button color="primary" (click)="nouveauDossier()">
            <mat-icon>add</mat-icon>
            Nouveau dossier
          </button>
        </div>
      </div>

      <!-- Filters Card -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput formControlName="search" placeholder="Référence, ID...">
              <mat-icon matPrefix>search</mat-icon>
              <button mat-icon-button matSuffix *ngIf="filterForm.get('search')?.value"
                      (click)="clearSearch()" type="button">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="">Tous</mat-option>
                <mat-option value="IMPORT">Importation</mat-option>
                <mat-option value="EXPORT">Exportation</mat-option>
                <mat-option value="TRANSIT">Transit</mat-option>
                <mat-option value="TEMPORARY">Temporaire</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">Tous</mat-option>
                <mat-option *ngFor="let status of statusOptions" [value]="status.value">
                  {{ status.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Du</mat-label>
              <input matInput [matDatepicker]="fromPicker" formControlName="fromDate" placeholder="JJ/MM/AAAA">
              <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Au</mat-label>
              <input matInput [matDatepicker]="toPicker" formControlName="toDate" placeholder="JJ/MM/AAAA">
              <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <button mat-icon-button color="primary" (click)="resetFilters()" matTooltip="Réinitialiser les filtres">
              <mat-icon>filter_alt_off</mat-icon>
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Active Filters -->
      <div class="active-filters" *ngIf="hasActiveFilters()">
        <span class="filter-label">Filtres actifs:</span>
        <mat-chip-set>
          <mat-chip *ngIf="filterForm.get('type')?.value" (removed)="clearFilter('type')">
            Type: {{ getTypeLabel(filterForm.get('type')?.value) }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="filterForm.get('status')?.value" (removed)="clearFilter('status')">
            Statut: {{ getStatusLabel(filterForm.get('status')?.value) }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="filterForm.get('fromDate')?.value" (removed)="clearFilter('fromDate')">
            Du: {{ filterForm.get('fromDate')?.value | date:'dd/MM/yyyy' }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="filterForm.get('toDate')?.value" (removed)="clearFilter('toDate')">
            Au: {{ filterForm.get('toDate')?.value | date:'dd/MM/yyyy' }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        </mat-chip-set>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des dossiers...</p>
      </div>

      <!-- Table -->
      <mat-card class="table-card" *ngIf="!loading">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)"
               class="declarations-table">

          <!-- Reference Column -->
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Référence</th>
            <td mat-cell *matCellDef="let element">
              <span class="reference-link" (click)="voirDossier(element.reference)">
                {{ element.reference }}
              </span>
            </td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [class]="'type-' + element.type.toLowerCase()">
                {{ getTypeLabel(element.type) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Importer/Exporter Column -->
          <ng-container matColumnDef="importer">
            <th mat-header-cell *matHeaderCellDef>Importateur/Exportateur</th>
            <td mat-cell *matCellDef="let element">
              <div class="party-info">
                <span class="party-name">{{ element.importerExporter?.name || '-' }}</span>
                <span class="party-tax">{{ element.importerExporter?.taxId || '' }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Value Column -->
          <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Valeur</th>
            <td mat-cell *matCellDef="let element">
              <span class="value-amount">{{ element.totalValue | number:'1.0-0' }}</span>
              <span class="value-currency">{{ element.currency }}</span>
            </td>
          </ng-container>

          <!-- Items Column -->
          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>Articles</th>
            <td mat-cell *matCellDef="let element">
              {{ element.goods?.length || 0 }} article(s)
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [class]="'status-' + element.status.toLowerCase()">
                {{ getStatusLabel(element.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Created Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
            <td mat-cell *matCellDef="let element">
              {{ element.createdAt | date:'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="voirDossier(element.reference)">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir le dossier</span>
                </button>
                <button mat-menu-item (click)="modifierDossier(element.reference)"
                        *ngIf="canEdit(element)">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item (click)="soumettreDossier(element)"
                        *ngIf="canSubmit(element)">
                  <mat-icon>send</mat-icon>
                  <span>Soumettre</span>
                </button>
                <button mat-menu-item (click)="initierPaiement(element)"
                        *ngIf="canPay(element)">
                  <mat-icon>payment</mat-icon>
                  <span>Payer</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="downloadDossier(element.reference)">
                  <mat-icon>download</mat-icon>
                  <span>Télécharger PDF</span>
                </button>
                <button mat-menu-item (click)="duplicateDossier(element)"
                        *ngIf="canDuplicate(element)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Dupliquer</span>
                </button>
                <mat-divider *ngIf="canDelete(element)"></mat-divider>
                <button mat-menu-item (click)="supprimerDossier(element)"
                        *ngIf="canDelete(element)" class="delete-action">
                  <mat-icon color="warn">delete</mat-icon>
                  <span>Supprimer</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="onRowClick(row)" class="clickable-row"></tr>
        </table>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="dataSource.data.length === 0">
          <mat-icon>inbox</mat-icon>
          <h3>Aucun dossier trouvé</h3>
          <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
          <p *ngIf="!hasActiveFilters()">Commencez par créer votre première déclaration d'importation</p>
          <button mat-flat-button color="primary" (click)="nouveauDossier()">
            <mat-icon>add</mat-icon>
            Nouveau dossier
          </button>
        </div>

        <!-- Paginator -->
        <mat-paginator
          *ngIf="dataSource.data.length > 0"
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50, 100]"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .import-list {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        color: #008751;
        font-size: 28px;
      }

      p {
        margin: 8px 0 0;
        color: #666;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .filters-card {
      margin-bottom: 16px;

      .filters-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;

        .search-field {
          flex: 1;
          min-width: 250px;
        }

        mat-form-field {
          width: 160px;
        }
      }
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 8px 16px;
      background: #f5f5f5;
      border-radius: 8px;

      .filter-label {
        font-size: 13px;
        color: #666;
      }

      mat-chip {
        background: #008751 !important;
        color: white !important;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #666;
    }

    .table-card {
      overflow: hidden;

      .declarations-table {
        width: 100%;

        .reference-link {
          font-family: 'Roboto Mono', monospace;
          font-weight: 500;
          color: #008751;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }

        .party-info {
          display: flex;
          flex-direction: column;

          .party-name {
            font-weight: 500;
          }

          .party-tax {
            font-size: 12px;
            color: #666;
            font-family: 'Roboto Mono', monospace;
          }
        }

        .value-amount {
          font-weight: 500;
        }

        .value-currency {
          font-size: 12px;
          color: #666;
          margin-left: 4px;
        }

        .clickable-row {
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #f5f5f5;
          }
        }

        .delete-action {
          color: #C62828;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0;
        color: #333;
      }

      p {
        color: #666;
        margin: 8px 0 24px;
      }
    }

    /* Status chip colors */
    mat-chip {
      &.status-draft {
        background: #ECEFF1 !important;
        color: #546E7A !important;
      }

      &.status-submitted {
        background: #E3F2FD !important;
        color: #1565C0 !important;
      }

      &.status-pending_payment {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.status-paid {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-in_process {
        background: #FFF8E1 !important;
        color: #F9A825 !important;
      }

      &.status-pending_documents {
        background: #FCE4EC !important;
        color: #C2185B !important;
      }

      &.status-pending_inspection {
        background: #EDE7F6 !important;
        color: #7B1FA2 !important;
      }

      &.status-approved {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-rejected {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }

      &.status-cancelled {
        background: #F5F5F5 !important;
        color: #9E9E9E !important;
      }

      /* Type chip colors */
      &.type-import {
        background: #E3F2FD !important;
        color: #1565C0 !important;
      }

      &.type-export {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.type-transit {
        background: #EDE7F6 !important;
        color: #7B1FA2 !important;
      }

      &.type-temporary {
        background: #F3E5F5 !important;
        color: #9C27B0 !important;
      }
    }

    @media (max-width: 1024px) {
      .import-list {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;

        .header-actions {
          width: 100%;
        }
      }

      .filters-form {
        flex-direction: column;

        mat-form-field, .search-field {
          width: 100% !important;
        }
      }
    }

    @media (max-width: 768px) {
      .table-card {
        overflow-x: auto;

        .declarations-table {
          min-width: 800px;
        }
      }
    }
  `]
})
export class ImportListComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private declarationService = inject(DeclarationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'reference', 'type', 'importer', 'value', 'items', 'status', 'createdAt', 'actions'
  ];

  dataSource = new MatTableDataSource<Declaration>([]);
  loading = true;
  totalElements = 0;
  pageSize = 25;
  currentPage = 0;
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  filterForm: FormGroup;

  statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SUBMITTED', label: 'Soumis' },
    { value: 'PENDING_PAYMENT', label: 'Attente paiement' },
    { value: 'PAID', label: 'Payé' },
    { value: 'IN_PROCESS', label: 'En cours de traitement' },
    { value: 'PENDING_DOCUMENTS', label: 'Attente documents' },
    { value: 'PENDING_INSPECTION', label: 'Attente inspection' },
    { value: 'APPROVED', label: 'Approuvé' },
    { value: 'REJECTED', label: 'Rejeté' },
    { value: 'CANCELLED', label: 'Annulé' }
  ];

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: [''],
      fromDate: [null],
      toDate: [null]
    });
  }

  ngOnInit(): void {
    // Check for query params (e.g., from dashboard status click)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['status']) {
        this.filterForm.patchValue({ status: params['status'] });
      }
      if (params['search']) {
        // Focus on search field if search param is present
      }
    });

    // Listen to filter changes with debounce
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadData();
      });

    this.loadData();
  }

  ngAfterViewInit(): void {
    // Connect sort to data source
    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe((sort: Sort) => {
        this.sortField = sort.active;
        this.sortDirection = sort.direction as 'asc' | 'desc' || 'desc';
        this.loadData();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;

    const filters = this.filterForm.value;
    const params: DeclarationSearchParams = {
      reference: filters.search || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: this.currentPage,
      size: this.pageSize
    };

    this.declarationService.search(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.totalElements = response.total || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading declarations:', error);
        this.snackBar.open('Erreur lors du chargement des dossiers', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.dataSource.data = [];
        this.totalElements = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'desc';
    this.loadData();
  }

  onRowClick(row: Declaration): void {
    this.voirDossier(row.reference);
  }

  // Filter helpers
  clearSearch(): void {
    this.filterForm.patchValue({ search: '' });
  }

  clearFilter(field: string): void {
    this.filterForm.patchValue({ [field]: field.includes('Date') ? null : '' });
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      type: '',
      status: '',
      fromDate: null,
      toDate: null
    });
  }

  hasActiveFilters(): boolean {
    const filters = this.filterForm.value;
    return !!(filters.type || filters.status || filters.fromDate || filters.toDate);
  }

  // Label helpers
  getStatusLabel(status: string): string {
    const found = this.statusOptions.find(s => s.value === status);
    return found?.label || status;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'IMPORT': 'Importation',
      'EXPORT': 'Exportation',
      'TRANSIT': 'Transit',
      'TEMPORARY': 'Temporaire'
    };
    return labels[type] || type;
  }

  // Action permission checks
  canEdit(declaration: Declaration): boolean {
    return declaration.status === DeclarationStatus.DRAFT;
  }

  canSubmit(declaration: Declaration): boolean {
    return declaration.status === DeclarationStatus.DRAFT;
  }

  canPay(declaration: Declaration): boolean {
    return declaration.status === DeclarationStatus.PENDING_PAYMENT;
  }

  canDuplicate(declaration: Declaration): boolean {
    return [DeclarationStatus.APPROVED, DeclarationStatus.REJECTED, DeclarationStatus.CANCELLED]
      .includes(declaration.status);
  }

  canDelete(declaration: Declaration): boolean {
    return declaration.status === DeclarationStatus.DRAFT;
  }

  // Navigation actions
  nouveauDossier(): void {
    this.router.navigate(['/e-force/import/nouveau']);
  }

  voirDossier(reference: string): void {
    this.router.navigate(['/e-force/import/dossier', reference]);
  }

  modifierDossier(reference: string): void {
    this.router.navigate(['/e-force/import/dossier', reference, 'edit']);
  }

  // Data actions
  soumettreDossier(declaration: Declaration): void {
    if (confirm(`Êtes-vous sûr de vouloir soumettre le dossier ${declaration.reference} ?`)) {
      this.declarationService.submit(declaration.id).subscribe({
        next: () => {
          this.snackBar.open('Dossier soumis avec succès', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la soumission', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  initierPaiement(declaration: Declaration): void {
    this.router.navigate(['/e-force/import/dossier', declaration.reference], {
      queryParams: { action: 'pay' }
    });
  }

  downloadDossier(reference: string): void {
    this.snackBar.open('Téléchargement du PDF en cours...', '', { duration: 2000 });
    // Implement PDF download
  }

  duplicateDossier(declaration: Declaration): void {
    if (confirm(`Voulez-vous créer une copie du dossier ${declaration.reference} ?`)) {
      // Create a new draft from existing declaration
      this.declarationService.createDraft(declaration.type).subscribe({
        next: (newDeclaration) => {
          this.snackBar.open('Dossier dupliqué avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/e-force/import/dossier', newDeclaration.reference, 'edit']);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la duplication', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  supprimerDossier(declaration: Declaration): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier ${declaration.reference} ? Cette action est irréversible.`)) {
      this.declarationService.delete(declaration.id).subscribe({
        next: () => {
          this.snackBar.open('Dossier supprimé', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  exportData(): void {
    this.snackBar.open('Export des données en cours...', '', { duration: 2000 });
    // Implement data export (CSV/Excel)
  }
}
