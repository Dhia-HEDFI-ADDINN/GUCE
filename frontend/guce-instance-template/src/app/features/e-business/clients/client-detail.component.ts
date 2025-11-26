import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'guce-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule],
  template: `
    <div class="client-detail-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/e-business/clients"><mat-icon>arrow_back</mat-icon></button>
        <div class="header-info">
          <h1>{{ client.name }}</h1>
          <p>{{ client.taxNumber }}</p>
        </div>
        <button mat-flat-button color="primary" [routerLink]="['/e-business/declarations/new']" [queryParams]="{clientId: client.id}">
          <mat-icon>add</mat-icon> Nouvelle déclaration
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="Informations">
          <mat-card class="tab-content">
            <div class="info-grid">
              <div class="info-item"><span class="label">Contact</span><span class="value">{{ client.contact }}</span></div>
              <div class="info-item"><span class="label">Email</span><span class="value">{{ client.email }}</span></div>
              <div class="info-item"><span class="label">Téléphone</span><span class="value">{{ client.phone }}</span></div>
              <div class="info-item"><span class="label">Adresse</span><span class="value">{{ client.address }}</span></div>
            </div>
          </mat-card>
        </mat-tab>
        <mat-tab label="Déclarations ({{ client.declarationsCount }})">
          <mat-card class="tab-content">
            <p>Liste des déclarations du client...</p>
          </mat-card>
        </mat-tab>
        <mat-tab label="Factures">
          <mat-card class="tab-content">
            <p>Liste des factures du client...</p>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .client-detail-container { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; .header-info { flex: 1; h1 { margin: 0; } p { margin: 4px 0 0; color: #757575; } } }
    .tab-content { margin-top: 24px; padding: 24px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; .info-item { .label { display: block; font-size: 12px; color: #757575; } .value { font-weight: 500; } } }
  `]
})
export class ClientDetailComponent {
  client = { id: '1', name: 'SARL Tech Import', taxNumber: 'M123456789A', contact: 'Jean Dupont', email: 'contact@techimport.cm', phone: '+237 699 123 456', address: 'BP 1234, Douala', declarationsCount: 12 };
}
