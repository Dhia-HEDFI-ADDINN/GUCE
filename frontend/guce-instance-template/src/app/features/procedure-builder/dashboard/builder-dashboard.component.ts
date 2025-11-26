import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'guce-builder-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="builder-dashboard">
      <h1>Procedure Builder</h1>
      <p>Configurez et gérez les procédures de votre instance GUCE</p>

      <div class="modules-grid">
        <mat-card class="module-card" routerLink="/config/procedures/list">
          <mat-icon>account_tree</mat-icon>
          <h3>Procédures</h3>
          <p>{{ stats.procedures }} procédures configurées</p>
          <button mat-flat-button color="primary">Gérer</button>
        </mat-card>

        <mat-card class="module-card" routerLink="/config/referentials/countries">
          <mat-icon>library_books</mat-icon>
          <h3>Référentiels</h3>
          <p>Données de référence</p>
          <button mat-flat-button color="primary">Gérer</button>
        </mat-card>

        <mat-card class="module-card" routerLink="/config/integrations">
          <mat-icon>sync</mat-icon>
          <h3>Intégrations</h3>
          <p>{{ stats.integrations }} intégrations actives</p>
          <button mat-flat-button color="primary">Configurer</button>
        </mat-card>
      </div>

      <mat-card class="recent-card">
        <mat-card-header><mat-card-title>Modifications récentes</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="recent-list">
            <div class="recent-item" *ngFor="let item of recentChanges">
              <mat-icon>{{ item.icon }}</mat-icon>
              <div class="item-info">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-user">{{ item.user }} - {{ item.date }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .builder-dashboard { padding: 24px; h1 { margin: 0 0 8px; } > p { color: #757575; margin: 0 0 24px; } }
    .modules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }
    .module-card { padding: 32px; text-align: center; mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1976d2; } h3 { margin: 16px 0 8px; } p { color: #757575; margin: 0 0 16px; } }
    .recent-card { .recent-list { .recent-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; mat-icon { color: #757575; } .item-info { .item-title { display: block; font-weight: 500; } .item-user { font-size: 12px; color: #9e9e9e; } } } } }
  `]
})
export class BuilderDashboardComponent {
  stats = { procedures: 12, integrations: 5 };
  recentChanges = [
    { icon: 'edit', title: 'Procédure Import modifiée', user: 'Admin', date: 'Il y a 2h' },
    { icon: 'add', title: 'Nouveau référentiel ajouté', user: 'Admin', date: 'Hier' }
  ];
}
