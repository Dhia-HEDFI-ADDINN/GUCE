import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

interface Document {
  id: string;
  name: string;
  type: string;
  reference: string;
  declarationRef: string;
  uploadDate: string;
  size: string;
  status: string;
}

@Component({
  selector: 'guce-document-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatMenuModule
  ],
  template: `
    <div class="document-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Mes documents</h1>
          <p>Gérez tous vos documents et pièces justificatives</p>
        </div>
        <button mat-flat-button color="primary" (click)="uploadNew()">
          <mat-icon>upload</mat-icon>
          Nouveau document
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [(ngModel)]="searchQuery" placeholder="Nom, référence..." (input)="filter()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (selectionChange)="filter()">
              <mat-option value="">Tous</mat-option>
              <mat-option value="INVOICE">Facture</mat-option>
              <mat-option value="BL">Connaissement</mat-option>
              <mat-option value="CERTIFICATE">Certificat</mat-option>
              <mat-option value="OTHER">Autre</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Documents Grid -->
      <div class="documents-grid">
        <mat-card class="document-card" *ngFor="let doc of filteredDocuments">
          <div class="doc-preview">
            <mat-icon>{{ getDocIcon(doc.type) }}</mat-icon>
          </div>
          <div class="doc-info">
            <h3>{{ doc.name }}</h3>
            <p class="doc-meta">
              <span class="doc-type">{{ getTypeLabel(doc.type) }}</span>
              <span class="doc-size">{{ doc.size }}</span>
            </p>
            <p class="doc-ref">
              <mat-icon>link</mat-icon>
              {{ doc.declarationRef }}
            </p>
            <p class="doc-date">Ajouté le {{ doc.uploadDate }}</p>
          </div>
          <div class="doc-actions">
            <button mat-icon-button [matMenuTriggerFor]="docMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #docMenu="matMenu">
              <button mat-menu-item (click)="view(doc)">
                <mat-icon>visibility</mat-icon>
                <span>Voir</span>
              </button>
              <button mat-menu-item (click)="download(doc)">
                <mat-icon>download</mat-icon>
                <span>Télécharger</span>
              </button>
              <button mat-menu-item (click)="share(doc)">
                <mat-icon>share</mat-icon>
                <span>Partager</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="delete(doc)" class="delete-action">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </div>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredDocuments.length === 0">
        <mat-icon>folder_open</mat-icon>
        <h3>Aucun document trouvé</h3>
        <p>Commencez par télécharger vos premiers documents</p>
        <button mat-flat-button color="primary" (click)="uploadNew()">
          <mat-icon>upload</mat-icon>
          Télécharger un document
        </button>
      </div>
    </div>
  `,
  styles: [`
    .document-list-container {
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
        }

        p {
          margin: 4px 0 0;
          color: #757575;
        }
      }
    }

    .filters-card {
      padding: 16px;
      margin-bottom: 24px;

      .filters-row {
        display: flex;
        gap: 16px;

        .search-field {
          flex: 1;
        }
      }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .document-card {
      display: flex;
      padding: 16px;
      gap: 16px;

      .doc-preview {
        width: 64px;
        height: 64px;
        background: #e3f2fd;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #1976d2;
        }
      }

      .doc-info {
        flex: 1;
        min-width: 0;

        h3 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-meta {
          display: flex;
          gap: 8px;
          margin: 0 0 8px;
          font-size: 12px;

          .doc-type {
            background: #e3f2fd;
            color: #1565c0;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .doc-size {
            color: #9e9e9e;
          }
        }

        .doc-ref {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0 0 4px;
          font-size: 12px;
          color: #616161;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }

        .doc-date {
          margin: 0;
          font-size: 11px;
          color: #9e9e9e;
        }
      }

      .delete-action {
        color: #c62828;
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
        margin-bottom: 24px;
      }
    }
  `]
})
export class DocumentListComponent implements OnInit {
  searchQuery = '';
  typeFilter = '';
  documents: Document[] = [];
  filteredDocuments: Document[] = [];

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documents = [
      { id: '1', name: 'Facture_2024_001234.pdf', type: 'INVOICE', reference: 'INV-2024-001234', declarationRef: 'IMP-2024-001234', uploadDate: '10/12/2024', size: '245 KB', status: 'valid' },
      { id: '2', name: 'Connaissement_BL12345.pdf', type: 'BL', reference: 'BL-12345', declarationRef: 'IMP-2024-001234', uploadDate: '10/12/2024', size: '512 KB', status: 'valid' },
      { id: '3', name: 'Certificat_Origine.pdf', type: 'CERTIFICATE', reference: 'CO-2024-5678', declarationRef: 'EXP-2024-005678', uploadDate: '08/12/2024', size: '189 KB', status: 'valid' },
      { id: '4', name: 'Liste_Colisage.pdf', type: 'OTHER', reference: 'PL-001234', declarationRef: 'IMP-2024-001234', uploadDate: '10/12/2024', size: '156 KB', status: 'valid' }
    ];
    this.filteredDocuments = [...this.documents];
  }

  filter() {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = !this.searchQuery ||
        doc.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.reference.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesType = !this.typeFilter || doc.type === this.typeFilter;

      return matchesSearch && matchesType;
    });
  }

  getDocIcon(type: string): string {
    const icons: Record<string, string> = {
      INVOICE: 'receipt',
      BL: 'local_shipping',
      CERTIFICATE: 'verified',
      OTHER: 'description'
    };
    return icons[type] || 'description';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      INVOICE: 'Facture',
      BL: 'Connaissement',
      CERTIFICATE: 'Certificat',
      OTHER: 'Autre'
    };
    return labels[type] || type;
  }

  uploadNew() {
    console.log('Upload new document');
  }

  view(doc: Document) {
    console.log('View', doc);
  }

  download(doc: Document) {
    console.log('Download', doc);
  }

  share(doc: Document) {
    console.log('Share', doc);
  }

  delete(doc: Document) {
    console.log('Delete', doc);
  }
}
