import { Component, OnInit } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';

interface Dossier {
  id: string;
  reference: string;
  type: string;
  operator: string;
  operatorId: string;
  receivedAt: string;
  deadline: string;
  priority: string;
  status: string;
}

@Component({
  selector: 'guce-inbox',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatCheckboxModule, MatTooltipModule
  ],
  template: `
    <div class="inbox-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Corbeille d'arrivée</h1>
          <p>{{ filteredDossiers.length }} dossiers en attente de traitement</p>
        </div>
        <div class="header-actions" *ngIf="selection.hasValue()">
          <button mat-stroked-button (click)="assignSelected()">
            <mat-icon>person_add</mat-icon>
            Assigner ({{ selection.selected.length }})
          </button>
          <button mat-flat-button color="primary" (click)="processSelected()">
            <mat-icon>play_arrow</mat-icon>
            Traiter ({{ selection.selected.length }})
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Référence, opérateur..." (input)="filter()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (selectionChange)="filter()">
              <mat-option value="">Tous</mat-option>
              <mat-option value="import">Import</mat-option>
              <mat-option value="export">Export</mat-option>
              <mat-option value="transit">Transit</mat-option>
              <mat-option value="certificate">Certificat</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priorité</mat-label>
            <mat-select [(ngModel)]="priorityFilter" (selectionChange)="filter()">
              <mat-option value="">Toutes</mat-option>
              <mat-option value="high">Haute</mat-option>
              <mat-option value="medium">Moyenne</mat-option>
              <mat-option value="low">Basse</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <table mat-table [dataSource]="filteredDossiers" matSort>
          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="$event ? masterToggle() : null"
                            [checked]="selection.hasValue() && isAllSelected()"
                            [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="$event ? selection.toggle(row) : null"
                            [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let d">
              <div class="priority-indicator" [class]="d.priority" [matTooltip]="getPriorityLabel(d.priority)"></div>
            </td>
          </ng-container>

          <!-- Reference Column -->
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Référence</th>
            <td mat-cell *matCellDef="let d">
              <a [routerLink]="['/e-gov/processing', d.id]" class="ref-link">{{ d.reference }}</a>
            </td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let d">{{ d.type }}</td>
          </ng-container>

          <!-- Operator Column -->
          <ng-container matColumnDef="operator">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Opérateur</th>
            <td mat-cell *matCellDef="let d">{{ d.operator }}</td>
          </ng-container>

          <!-- Received Column -->
          <ng-container matColumnDef="receivedAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Reçu le</th>
            <td mat-cell *matCellDef="let d">{{ d.receivedAt }}</td>
          </ng-container>

          <!-- Deadline Column -->
          <ng-container matColumnDef="deadline">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Échéance</th>
            <td mat-cell *matCellDef="let d">
              <span [class.overdue]="isOverdue(d.deadline)">{{ d.deadline }}</span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let d">
              <button mat-flat-button color="primary" size="small" [routerLink]="['/e-gov/processing', d.id]">
                Traiter
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="selection.toggle(row)"></tr>
        </table>
        <mat-paginator [pageSize]="25" [pageSizeOptions]="[10, 25, 50]"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .inbox-container { padding: 24px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 24px; }
      p { margin: 4px 0 0; color: #757575; }

      .header-actions { display: flex; gap: 12px; }
    }

    .filters-card {
      padding: 16px;
      margin-bottom: 24px;

      .filters-row {
        display: flex;
        gap: 16px;

        .search-field { flex: 1; }
      }
    }

    .table-card {
      overflow: hidden;

      table { width: 100%; }

      .priority-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.high { background: #f44336; }
        &.medium { background: #ff9800; }
        &.low { background: #4caf50; }
      }

      .ref-link {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;

        &:hover { text-decoration: underline; }
      }

      .overdue { color: #f44336; font-weight: 500; }
    }
  `]
})
export class InboxComponent implements OnInit {
  displayedColumns = ['select', 'priority', 'reference', 'type', 'operator', 'receivedAt', 'deadline', 'actions'];
  selection = new SelectionModel<Dossier>(true, []);

  searchQuery = '';
  typeFilter = '';
  priorityFilter = '';

  dossiers: Dossier[] = [];
  filteredDossiers: Dossier[] = [];

  ngOnInit() {
    this.loadDossiers();
  }

  loadDossiers() {
    this.dossiers = [
      { id: '1', reference: 'IMP-2024-001234', type: 'Déclaration Import', operator: 'SARL Tech Import', operatorId: 'OP001', receivedAt: '10/12/2024 09:30', deadline: '12/12/2024', priority: 'high', status: 'pending' },
      { id: '2', reference: 'CERT-2024-005678', type: 'Certificat Origine', operator: 'Agro Export SA', operatorId: 'OP002', receivedAt: '10/12/2024 08:15', deadline: '15/12/2024', priority: 'medium', status: 'pending' },
      { id: '3', reference: 'IMP-2024-001235', type: 'Déclaration Import', operator: 'Auto Parts SARL', operatorId: 'OP003', receivedAt: '10/12/2024 07:45', deadline: '13/12/2024', priority: 'low', status: 'pending' },
      { id: '4', reference: 'EXP-2024-009012', type: 'Déclaration Export', operator: 'Cacao Plus', operatorId: 'OP004', receivedAt: '09/12/2024 16:20', deadline: '11/12/2024', priority: 'high', status: 'pending' },
      { id: '5', reference: 'TRS-2024-000123', type: 'Transit', operator: 'Transport Express', operatorId: 'OP005', receivedAt: '09/12/2024 14:00', deadline: '14/12/2024', priority: 'medium', status: 'pending' }
    ];
    this.filteredDossiers = [...this.dossiers];
  }

  filter() {
    this.filteredDossiers = this.dossiers.filter(d => {
      const matchesSearch = !this.searchQuery ||
        d.reference.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        d.operator.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = !this.typeFilter || d.type.toLowerCase().includes(this.typeFilter);
      const matchesPriority = !this.priorityFilter || d.priority === this.priorityFilter;
      return matchesSearch && matchesType && matchesPriority;
    });
  }

  isAllSelected() {
    return this.selection.selected.length === this.filteredDossiers.length;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredDossiers.forEach(row => this.selection.select(row));
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
    return labels[priority] || priority;
  }

  isOverdue(deadline: string): boolean {
    return false; // Simplified
  }

  assignSelected() {
    console.log('Assign', this.selection.selected);
  }

  processSelected() {
    console.log('Process', this.selection.selected);
  }
}
