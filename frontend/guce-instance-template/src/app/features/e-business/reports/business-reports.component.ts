import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-business-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="reports-container">
      <h1>Rapports</h1>

      <div class="reports-grid">
        <mat-card class="report-card" *ngFor="let report of reports">
          <mat-icon>{{ report.icon }}</mat-icon>
          <h3>{{ report.name }}</h3>
          <p>{{ report.description }}</p>
          <button mat-flat-button color="primary" (click)="generate(report)">
            <mat-icon>download</mat-icon> Générer
          </button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 24px; h1 { margin: 0 0 24px; } }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .report-card { padding: 24px; text-align: center; mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1976d2; } h3 { margin: 16px 0 8px; } p { color: #757575; margin-bottom: 16px; } }
  `]
})
export class BusinessReportsComponent {
  reports = [
    { icon: 'assessment', name: 'Rapport d\'activité', description: 'Synthèse des déclarations et transactions' },
    { icon: 'account_balance', name: 'Rapport financier', description: 'État des paiements et facturation' },
    { icon: 'people', name: 'Rapport clients', description: 'Statistiques par client' }
  ];

  generate(report: any) {
    console.log('Generate', report);
  }
}
