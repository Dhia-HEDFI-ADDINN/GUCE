import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FimexService } from '../../../core/services/fimex.service';
import {
  InscriptionFIMEX,
  StatutFIMEX,
  TypeInscriptionFIMEX,
  FIMEXSearchParams,
  getStatutLabel,
  getTypeInscriptionLabel
} from '../../../core/models/fimex.model';

/**
 * Liste des inscriptions FIMEX avec filtres et pagination
 */
@Component({
  selector: 'guce-fimex-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatMenuModule, MatTooltipModule
  ],
  template: `
    <div class="fimex-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Inscriptions FIMEX</h1>
          <p>Gérez toutes vos inscriptions au Fichier des Importateurs et Exportateurs</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" (click)="nouvelleInscription()">
            <mat-icon>add</mat-icon>
            Nouvelle inscription
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput formControlName="search" placeholder="N° FIMEX, NINEA, Raison sociale...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="typeInscription">
                <mat-option [value]="null">Tous</mat-option>
                <mat-option *ngFor="let type of typeOptions" [value]="type.value">
                  {{ type.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option [value]="null">Tous</mat-option>
                <mat-option *ngFor="let statut of statutOptions" [value]="statut.value">
                  {{ statut.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="resetFilters()" matTooltip="Réinitialiser">
              <mat-icon>refresh</mat-icon>
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Table -->
      <mat-card class="table-card" *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="inscriptions-table">
            <!-- N° FIMEX -->
            <ng-container matColumnDef="numeroFIMEX">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>N° FIMEX</th>
              <td mat-cell *matCellDef="let row">
                <a class="fimex-link" (click)="voirDetail(row.numeroFIMEX)">
                  {{ row.numeroFIMEX }}
                </a>
              </td>
            </ng-container>

            <!-- Entreprise -->
            <ng-container matColumnDef="entreprise">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Entreprise</th>
              <td mat-cell *matCellDef="let row">
                <div class="entreprise-cell">
                  <span class="entreprise-name">{{ row.entreprise.raisonSociale }}</span>
                  <span class="entreprise-ninea">{{ row.entreprise.ninea }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="typeInscription">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="type-chip">{{ getTypeLabel(row.typeInscription) }}</mat-chip>
              </td>
            </ng-container>

            <!-- Statut -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class]="'status-' + row.statut.toLowerCase()">
                  {{ getStatutLabel(row.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Date inscription -->
            <ng-container matColumnDef="dateInscription">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date inscription</th>
              <td mat-cell *matCellDef="let row">{{ row.dateInscription | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <!-- Date expiration -->
            <ng-container matColumnDef="dateExpiration">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Expiration</th>
              <td mat-cell *matCellDef="let row" [class.expired]="isExpired(row.dateExpiration)">
                {{ row.dateExpiration | date:'dd/MM/yyyy' }}
                <mat-icon class="expiring-icon" *ngIf="isExpiringSoon(row.dateExpiration)" matTooltip="Expire bientôt">
                  warning
                </mat-icon>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="voirDetail(row.numeroFIMEX)">
                    <mat-icon>visibility</mat-icon>
                    <span>Voir détail</span>
                  </button>
                  <button mat-menu-item (click)="telechargerCertificat(row)"
                          *ngIf="row.statut === 'ACTIF'">
                    <mat-icon>download</mat-icon>
                    <span>Télécharger certificat</span>
                  </button>
                  <button mat-menu-item (click)="renouveler(row)"
                          *ngIf="row.statut === 'ACTIF' && isExpiringSoon(row.dateExpiration)">
                    <mat-icon>refresh</mat-icon>
                    <span>Renouveler</span>
                  </button>
                  <button mat-menu-item (click)="amender(row)"
                          *ngIf="row.statut === 'ACTIF'">
                    <mat-icon>edit</mat-icon>
                    <span>Modifier</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                (click)="voirDetail(row.numeroFIMEX)" class="clickable-row"></tr>
          </table>

          <div class="no-data" *ngIf="dataSource.data.length === 0">
            <mat-icon>inbox</mat-icon>
            <p>Aucune inscription trouvée</p>
            <button mat-stroked-button (click)="nouvelleInscription()">
              Créer une inscription
            </button>
          </div>

          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                         [pageSize]="10"
                         showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .fimex-list-container {
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
      }

      p {
        margin: 8px 0 0;
        color: #666;
      }
    }

    .filters-card {
      margin-bottom: 24px;

      .filters-form {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 200px;
        }
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .table-card {
      .inscriptions-table {
        width: 100%;

        .clickable-row {
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #f5f5f5;
          }
        }

        .fimex-link {
          font-family: 'Roboto Mono', monospace;
          color: #008751;
          cursor: pointer;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }

        .entreprise-cell {
          display: flex;
          flex-direction: column;

          .entreprise-name {
            font-weight: 500;
          }

          .entreprise-ninea {
            font-size: 12px;
            color: #666;
          }
        }

        .type-chip {
          font-size: 11px;
          height: 24px;
          background: #E3F2FD;
          color: #1565C0;
        }

        .expired {
          color: #C62828;
        }

        .expiring-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #E65100;
          vertical-align: middle;
          margin-left: 4px;
        }
      }
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      p {
        margin-bottom: 16px;
      }
    }

    mat-chip {
      &.status-actif {
        background: #E8F5E9 !important;
        color: #2E7D32 !important;
      }

      &.status-expire {
        background: #FFEBEE !important;
        color: #C62828 !important;
      }

      &.status-en_attente_paiement, &.status-soumis {
        background: #FFF3E0 !important;
        color: #E65100 !important;
      }

      &.status-brouillon {
        background: #ECEFF1 !important;
        color: #546E7A !important;
      }
    }
  `]
})
export class FimexListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fimexService = inject(FimexService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<InscriptionFIMEX>([]);
  displayedColumns = ['numeroFIMEX', 'entreprise', 'typeInscription', 'statut', 'dateInscription', 'dateExpiration', 'actions'];

  typeOptions = [
    { value: TypeInscriptionFIMEX.IMPORT, label: 'Import' },
    { value: TypeInscriptionFIMEX.EXPORT, label: 'Export' },
    { value: TypeInscriptionFIMEX.IMPORT_EXPORT, label: 'Import/Export' }
  ];

  statutOptions = [
    { value: StatutFIMEX.ACTIF, label: 'Actif' },
    { value: StatutFIMEX.BROUILLON, label: 'Brouillon' },
    { value: StatutFIMEX.SOUMIS, label: 'Soumis' },
    { value: StatutFIMEX.EN_ATTENTE_PAIEMENT, label: 'En attente paiement' },
    { value: StatutFIMEX.EXPIRE, label: 'Expiré' },
    { value: StatutFIMEX.REJETE, label: 'Rejeté' }
  ];

  ngOnInit(): void {
    this.initFilters();
    this.loadInscriptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initFilters(): void {
    this.filterForm = this.fb.group({
      search: [''],
      typeInscription: [null],
      statut: [null]
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  loadInscriptions(): void {
    this.loading = true;
    this.fimexService.getMyInscriptions().subscribe({
      next: (inscriptions) => {
        this.dataSource.data = inscriptions;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Erreur de chargement', 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.dataSource.filterPredicate = (data: InscriptionFIMEX, filter: string) => {
      const searchMatch = !filters.search ||
        data.numeroFIMEX.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.entreprise.raisonSociale.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.entreprise.ninea.toLowerCase().includes(filters.search.toLowerCase());

      const typeMatch = !filters.typeInscription || data.typeInscription === filters.typeInscription;
      const statutMatch = !filters.statut || data.statut === filters.statut;

      return searchMatch && typeMatch && statutMatch;
    };

    this.dataSource.filter = JSON.stringify(filters);
  }

  resetFilters(): void {
    this.filterForm.reset();
  }

  getStatutLabel(statut: StatutFIMEX): string {
    return getStatutLabel(statut);
  }

  getTypeLabel(type: TypeInscriptionFIMEX): string {
    return getTypeInscriptionLabel(type);
  }

  isExpired(date: Date): boolean {
    return new Date(date) < new Date();
  }

  isExpiringSoon(date: Date): boolean {
    const expiration = new Date(date);
    const today = new Date();
    const days = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 60;
  }

  nouvelleInscription(): void {
    this.router.navigate(['/e-force/fimex/nouvelle-inscription']);
  }

  voirDetail(numeroFIMEX: string): void {
    this.router.navigate(['/e-force/fimex/inscription', numeroFIMEX]);
  }

  renouveler(inscription: InscriptionFIMEX): void {
    this.router.navigate(['/e-force/fimex/renouvellement', inscription.numeroFIMEX]);
  }

  amender(inscription: InscriptionFIMEX): void {
    this.router.navigate(['/e-force/fimex/amendement', inscription.numeroFIMEX]);
  }

  telechargerCertificat(inscription: InscriptionFIMEX): void {
    this.fimexService.downloadCertificat(inscription.numeroFIMEX).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificat-fimex-${inscription.numeroFIMEX}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => this.snackBar.open(error.message, 'Fermer', { duration: 5000 })
    });
  }
}
