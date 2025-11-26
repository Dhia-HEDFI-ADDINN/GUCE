import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

interface Procedure {
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  requirements: string[];
  estimatedTime: string;
  fees: string;
}

@Component({
  selector: 'guce-procedure-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatInputModule, MatChipsModule],
  template: `
    <div class="procedure-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Catalogue des procédures</h1>
          <p>Sélectionnez une procédure pour démarrer une nouvelle demande</p>
        </div>
      </div>

      <!-- Search -->
      <mat-card class="search-card">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher une procédure..." (input)="filterProcedures()">
        </div>
        <div class="category-filters">
          <mat-chip-listbox [(ngModel)]="selectedCategory" (change)="filterProcedures()">
            <mat-chip-option value="">Toutes</mat-chip-option>
            <mat-chip-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-chip-option>
          </mat-chip-listbox>
        </div>
      </mat-card>

      <!-- Procedures Grid -->
      <div class="procedures-grid">
        <mat-card class="procedure-card" *ngFor="let proc of filteredProcedures" [routerLink]="['/e-force/procedures', proc.code, 'new']">
          <div class="proc-header">
            <div class="proc-icon" [style.background]="proc.color">
              <mat-icon>{{ proc.icon }}</mat-icon>
            </div>
            <mat-chip class="proc-category">{{ proc.category }}</mat-chip>
          </div>

          <div class="proc-content">
            <h3>{{ proc.name }}</h3>
            <p class="proc-code">{{ proc.code }}</p>
            <p class="proc-description">{{ proc.description }}</p>
          </div>

          <div class="proc-meta">
            <div class="meta-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ proc.estimatedTime }}</span>
            </div>
            <div class="meta-item">
              <mat-icon>payments</mat-icon>
              <span>{{ proc.fees }}</span>
            </div>
          </div>

          <div class="proc-footer">
            <span class="requirements">{{ proc.requirements.length }} documents requis</span>
            <button mat-flat-button color="primary">
              Démarrer <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProcedures.length === 0">
        <mat-icon>search_off</mat-icon>
        <h3>Aucune procédure trouvée</h3>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    </div>
  `,
  styles: [`
    .procedure-list-container {
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      p {
        margin: 8px 0 0;
        color: #757575;
      }
    }

    .search-card {
      padding: 20px;
      margin-bottom: 24px;

      .search-box {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f5f5f5;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;

        mat-icon {
          color: #9e9e9e;
        }

        input {
          border: none;
          background: none;
          outline: none;
          font-size: 16px;
          width: 100%;
        }
      }

      .category-filters {
        mat-chip-listbox {
          display: flex;
          gap: 8px;
        }
      }
    }

    .procedures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .procedure-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }

      .proc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px;

        .proc-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: white;
          }
        }

        .proc-category {
          font-size: 11px;
        }
      }

      .proc-content {
        padding: 0 16px;
        flex: 1;

        h3 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 600;
        }

        .proc-code {
          margin: 0 0 8px;
          font-size: 12px;
          color: #1976d2;
          font-weight: 500;
        }

        .proc-description {
          margin: 0;
          font-size: 14px;
          color: #616161;
          line-height: 1.5;
        }
      }

      .proc-meta {
        display: flex;
        gap: 24px;
        padding: 16px;
        background: #fafafa;
        margin: 16px 16px 0;
        border-radius: 8px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #616161;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #9e9e9e;
          }
        }
      }

      .proc-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-top: 1px solid #f0f0f0;

        .requirements {
          font-size: 12px;
          color: #9e9e9e;
        }

        button mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-left: 4px;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 64px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #9e9e9e;
      }

      h3 {
        margin: 16px 0 8px;
        color: #616161;
      }

      p {
        color: #9e9e9e;
      }
    }
  `]
})
export class ProcedureListComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  categories: string[] = [];
  procedures: Procedure[] = [];
  filteredProcedures: Procedure[] = [];

  ngOnInit() {
    this.loadProcedures();
  }

  loadProcedures() {
    this.procedures = [
      {
        code: 'CERT-ORIG',
        name: 'Certificat d\'Origine',
        description: 'Demande de certificat d\'origine pour les marchandises exportées attestant leur provenance.',
        category: 'Export',
        icon: 'verified',
        color: '#388e3c',
        requirements: ['Facture commerciale', 'Liste de colisage', 'Déclaration export'],
        estimatedTime: '2-3 jours',
        fees: '25 000 XAF'
      },
      {
        code: 'CERT-PHYTO',
        name: 'Certificat Phytosanitaire',
        description: 'Certificat attestant que les végétaux et produits végétaux sont conformes aux normes phytosanitaires.',
        category: 'Export',
        icon: 'eco',
        color: '#4caf50',
        requirements: ['Demande', 'Résultats d\'analyse', 'Certificat origine'],
        estimatedTime: '3-5 jours',
        fees: '50 000 XAF'
      },
      {
        code: 'LICENCE-IMP',
        name: 'Licence d\'Importation',
        description: 'Autorisation préalable pour l\'importation de certains produits réglementés.',
        category: 'Import',
        icon: 'assignment_turned_in',
        color: '#1976d2',
        requirements: ['Demande motivée', 'Facture pro-forma', 'Documents société'],
        estimatedTime: '5-7 jours',
        fees: '100 000 XAF'
      },
      {
        code: 'FERI',
        name: 'Fiche d\'Enregistrement des Recettes d\'Importation',
        description: 'Document obligatoire pour le règlement financier des importations.',
        category: 'Import',
        icon: 'account_balance',
        color: '#7b1fa2',
        requirements: ['Facture pro-forma', 'Domiciliation bancaire'],
        estimatedTime: '1-2 jours',
        fees: '15 000 XAF'
      },
      {
        code: 'CERT-CONFORM',
        name: 'Certificat de Conformité',
        description: 'Attestation de conformité des produits importés aux normes et standards nationaux.',
        category: 'Import',
        icon: 'check_circle',
        color: '#f57c00',
        requirements: ['Demande', 'Rapport d\'inspection', 'Échantillons'],
        estimatedTime: '7-10 jours',
        fees: '0.5% valeur FOB'
      },
      {
        code: 'TRANSIT-AUTH',
        name: 'Autorisation de Transit',
        description: 'Autorisation pour le transit de marchandises à travers le territoire national.',
        category: 'Transit',
        icon: 'local_shipping',
        color: '#00796b',
        requirements: ['Déclaration transit', 'Itinéraire', 'Caution'],
        estimatedTime: '1 jour',
        fees: '30 000 XAF'
      }
    ];

    this.categories = [...new Set(this.procedures.map(p => p.category))];
    this.filteredProcedures = [...this.procedures];
  }

  filterProcedures() {
    this.filteredProcedures = this.procedures.filter(proc => {
      const matchesSearch = !this.searchQuery ||
        proc.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        proc.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        proc.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = !this.selectedCategory || proc.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }
}
