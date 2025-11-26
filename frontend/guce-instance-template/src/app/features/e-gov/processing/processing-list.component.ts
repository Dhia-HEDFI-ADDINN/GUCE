import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-processing-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatInputModule
  ],
  template: `
    <div class="processing-list-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Dossiers en traitement</h1>
          <p>{{ dossiers.length }} dossiers en cours de traitement</p>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" placeholder="Référence, opérateur...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      <!-- Dossier Cards -->
      <div class="dossiers-grid">
        <mat-card class="dossier-card" *ngFor="let d of dossiers" [routerLink]="['/e-gov/processing', d.id]">
          <div class="card-header">
            <div class="priority" [class]="d.priority"></div>
            <span class="reference">{{ d.reference }}</span>
            <mat-chip [class]="'status-' + d.status">{{ getStatusLabel(d.status) }}</mat-chip>
          </div>
          <div class="card-body">
            <div class="info-row">
              <mat-icon>business</mat-icon>
              <span>{{ d.operator }}</span>
            </div>
            <div class="info-row">
              <mat-icon>category</mat-icon>
              <span>{{ d.type }}</span>
            </div>
            <div class="info-row">
              <mat-icon>schedule</mat-icon>
              <span>Échéance: {{ d.deadline }}</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="step">{{ d.currentStep }}</span>
            <button mat-flat-button color="primary" size="small">
              Continuer <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="dossiers.length === 0">
        <mat-icon>inbox</mat-icon>
        <h3>Aucun dossier en traitement</h3>
        <p>Prenez des dossiers depuis la corbeille d'arrivée</p>
        <button mat-flat-button color="primary" routerLink="/e-gov/inbox">
          Voir la corbeille
        </button>
      </div>
    </div>
  `,
  styles: [`
    .processing-list-container { padding: 24px; }

    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 24px; }
      p { margin: 4px 0 0; color: #757575; }
    }

    .filters-card {
      padding: 16px;
      margin-bottom: 24px;

      .search-field { width: 100%; max-width: 400px; }
    }

    .dossiers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .dossier-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;

        .priority {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.high { background: #f44336; }
          &.medium { background: #ff9800; }
          &.low { background: #4caf50; }
        }

        .reference { flex: 1; font-weight: 600; }
      }

      .card-body {
        padding: 16px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #616161;

          mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9e9e9e; }

          &:last-child { margin-bottom: 0; }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #fafafa;

        .step { font-size: 12px; color: #757575; }

        button mat-icon { font-size: 16px; width: 16px; height: 16px; margin-left: 4px; }
      }
    }

    ::ng-deep {
      .status-in_progress { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-review { background-color: #e3f2fd !important; color: #1565c0 !important; }
      .status-pending_docs { background-color: #fce4ec !important; color: #c2185b !important; }
    }

    .empty-state {
      text-align: center;
      padding: 64px;

      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #9e9e9e; }
      h3 { margin: 16px 0 8px; color: #616161; }
      p { color: #9e9e9e; margin-bottom: 24px; }
    }
  `]
})
export class ProcessingListComponent implements OnInit {
  searchQuery = '';

  dossiers = [
    { id: '1', reference: 'IMP-2024-001230', type: 'Déclaration Import', operator: 'SARL Tech Import', deadline: '12/12/2024', priority: 'high', status: 'in_progress', currentStep: 'Vérification documents' },
    { id: '2', reference: 'EXP-2024-005670', type: 'Déclaration Export', operator: 'Agro Export SA', deadline: '14/12/2024', priority: 'medium', status: 'review', currentStep: 'Contrôle conformité' },
    { id: '3', reference: 'CERT-2024-001234', type: 'Certificat Origine', operator: 'Cacao Plus', deadline: '15/12/2024', priority: 'low', status: 'pending_docs', currentStep: 'En attente documents' }
  ];

  ngOnInit() {}

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_progress: 'En cours',
      review: 'En révision',
      pending_docs: 'Docs manquants'
    };
    return labels[status] || status;
  }
}
