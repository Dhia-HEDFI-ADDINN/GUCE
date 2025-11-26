import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'guce-integration-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  template: `
    <div class="integrations-container">
      <h1>Intégrations</h1>
      <p>Configurez les connexions avec les systèmes externes</p>

      <div class="integrations-grid">
        <mat-card class="integration-card" *ngFor="let int of integrations">
          <div class="int-header">
            <mat-icon>{{ int.icon }}</mat-icon>
            <mat-slide-toggle [checked]="int.active"></mat-slide-toggle>
          </div>
          <h3>{{ int.name }}</h3>
          <p>{{ int.description }}</p>
          <div class="int-status" [class.active]="int.active">
            {{ int.active ? 'Connecté' : 'Déconnecté' }}
          </div>
          <button mat-stroked-button>Configurer</button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .integrations-container { padding: 24px; h1 { margin: 0 0 8px; } > p { color: #757575; margin: 0 0 24px; } }
    .integrations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .integration-card { padding: 24px; .int-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1976d2; } } h3 { margin: 0 0 8px; } p { color: #757575; margin: 0 0 16px; } .int-status { font-size: 12px; margin-bottom: 16px; &.active { color: #4caf50; } } button { width: 100%; } }
  `]
})
export class IntegrationListComponent {
  integrations = [
    { icon: 'account_balance', name: 'Banques', description: 'Intégration système bancaire', active: true },
    { icon: 'local_shipping', name: 'Douanes', description: 'Système SYDONIA', active: true },
    { icon: 'sailing', name: 'Port', description: 'Système portuaire', active: false },
    { icon: 'payments', name: 'Paiement', description: 'Passerelle de paiement', active: true }
  ];
}
