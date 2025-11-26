import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-dashboard">
      <div class="page-header">
        <h1>Administration</h1>
        <p>Gestion de l'instance {{INSTANCE_NAME}}</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon>people</mat-icon>
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">Utilisateurs</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>business</mat-icon>
          <div class="stat-value">{{ stats.organizations }}</div>
          <div class="stat-label">Organisations</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>security</mat-icon>
          <div class="stat-value">{{ stats.roles }}</div>
          <div class="stat-label">Rôles</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>verified_user</mat-icon>
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">Utilisateurs actifs</div>
        </mat-card>
      </div>

      <div class="admin-sections">
        <mat-card class="section-card" *ngFor="let section of sections">
          <mat-icon [style.color]="section.color">{{ section.icon }}</mat-icon>
          <div class="section-content">
            <h3>{{ section.title }}</h3>
            <p>{{ section.description }}</p>
          </div>
          <button mat-flat-button color="primary" [routerLink]="section.link">
            Accéder
          </button>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <button mat-stroked-button routerLink="/admin/users/new">
            <mat-icon>person_add</mat-icon>
            Nouvel utilisateur
          </button>
          <button mat-stroked-button routerLink="/admin/organizations/new">
            <mat-icon>add_business</mat-icon>
            Nouvelle organisation
          </button>
          <button mat-stroked-button routerLink="/admin/audit/actions">
            <mat-icon>history</mat-icon>
            Voir les logs
          </button>
          <button mat-stroked-button routerLink="/admin/settings">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Activité récente</h2>
        <mat-card>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivity">
              <mat-icon [class]="activity.type">{{ getActivityIcon(activity.type) }}</mat-icon>
              <div class="activity-content">
                <span class="activity-text">{{ activity.text }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard { padding: 24px; }
    .page-header { margin-bottom: 24px; h1 { margin: 0 0 8px; } p { color: #757575; margin: 0; } }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { padding: 24px; text-align: center; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1976d2; margin-bottom: 8px; } .stat-value { font-size: 32px; font-weight: 600; } .stat-label { color: #757575; } }
    .admin-sections { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
    .section-card { padding: 24px; display: flex; align-items: center; gap: 16px; mat-icon { font-size: 40px; width: 40px; height: 40px; } .section-content { flex: 1; h3 { margin: 0 0 4px; } p { margin: 0; color: #757575; font-size: 14px; } } }
    .quick-actions { margin-bottom: 32px; h2 { margin: 0 0 16px; } .actions-grid { display: flex; gap: 16px; button { mat-icon { margin-right: 8px; } } } }
    .recent-activity { h2 { margin: 0 0 16px; } mat-card { padding: 0; } .activity-list { .activity-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #e0e0e0; &:last-child { border-bottom: none; } mat-icon { &.login { color: #4caf50; } &.logout { color: #ff9800; } &.create { color: #2196f3; } &.update { color: #9c27b0; } &.delete { color: #f44336; } } .activity-content { flex: 1; display: flex; justify-content: space-between; .activity-time { color: #757575; font-size: 12px; } } } } }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .admin-sections { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent {
  stats = {
    users: 1247,
    organizations: 356,
    roles: 12,
    activeUsers: 89
  };

  sections = [
    { icon: 'people', title: 'Utilisateurs', description: 'Gérer les comptes utilisateurs', link: '/admin/users', color: '#1976d2' },
    { icon: 'security', title: 'Rôles & Permissions', description: 'Configurer les droits d\'accès', link: '/admin/roles', color: '#9c27b0' },
    { icon: 'business', title: 'Organisations', description: 'Gérer les entreprises et administrations', link: '/admin/organizations', color: '#4caf50' },
    { icon: 'history', title: 'Audit', description: 'Consulter les logs d\'activité', link: '/admin/audit', color: '#ff9800' },
    { icon: 'monitor_heart', title: 'Monitoring', description: 'Surveiller l\'état du système', link: '/admin/monitoring', color: '#f44336' },
    { icon: 'settings', title: 'Paramètres', description: 'Configuration de l\'instance', link: '/admin/settings', color: '#607d8b' }
  ];

  recentActivity = [
    { type: 'create', text: 'Nouvel utilisateur créé: jean.dupont@example.com', time: 'Il y a 5 min' },
    { type: 'login', text: 'Connexion: marie.claire@admin.gov', time: 'Il y a 12 min' },
    { type: 'update', text: 'Rôle "Validateur" mis à jour', time: 'Il y a 1 heure' },
    { type: 'delete', text: 'Organisation "Test Corp" supprimée', time: 'Il y a 2 heures' },
    { type: 'logout', text: 'Déconnexion: admin@guce.gov', time: 'Il y a 3 heures' }
  ];

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      login: 'login', logout: 'logout', create: 'add_circle', update: 'edit', delete: 'delete'
    };
    return icons[type] || 'info';
  }
}
