import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'guce-user-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTabsModule,
    MatTableModule, MatChipsModule, MatMenuModule, MatDividerModule
  ],
  template: `
    <div class="user-detail">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/users">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>{{ user.name }}</h1>
          <span class="status-badge" [class]="user.status">{{ getStatusLabel(user.status) }}</span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button [routerLink]="['/admin/users', userId, 'edit']">
            <mat-icon>edit</mat-icon> Modifier
          </button>
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item>
              <mat-icon>lock_reset</mat-icon> Réinitialiser mot de passe
            </button>
            <button mat-menu-item>
              <mat-icon>mail</mat-icon> Envoyer invitation
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item class="warn">
              <mat-icon>block</mat-icon> Désactiver le compte
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="user-content">
        <div class="profile-section">
          <mat-card class="profile-card">
            <div class="avatar-large">{{ user.initials }}</div>
            <h2>{{ user.name }}</h2>
            <p class="job-title">{{ user.jobTitle }}</p>
            <p class="organization">{{ user.organization }}</p>
            <mat-chip>{{ user.role }}</mat-chip>

            <mat-divider></mat-divider>

            <div class="contact-info">
              <div class="info-item">
                <mat-icon>email</mat-icon>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item">
                <mat-icon>phone</mat-icon>
                <span>{{ user.phone }}</span>
              </div>
              <div class="info-item">
                <mat-icon>language</mat-icon>
                <span>{{ user.language === 'fr' ? 'Français' : 'English' }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="account-info">
              <div class="info-row">
                <span class="label">Créé le</span>
                <span>{{ user.createdAt }}</span>
              </div>
              <div class="info-row">
                <span class="label">Dernière connexion</span>
                <span>{{ user.lastLogin }}</span>
              </div>
              <div class="info-row">
                <span class="label">Email vérifié</span>
                <mat-icon [class.verified]="user.emailVerified">
                  {{ user.emailVerified ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </div>
              <div class="info-row">
                <span class="label">2FA activé</span>
                <mat-icon [class.verified]="user.twoFactorEnabled">
                  {{ user.twoFactorEnabled ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </div>
            </div>
          </mat-card>
        </div>

        <div class="details-section">
          <mat-card>
            <mat-tab-group>
              <mat-tab label="Activité">
                <div class="tab-content">
                  <div class="activity-list">
                    <div class="activity-item" *ngFor="let activity of activities">
                      <mat-icon [class]="activity.type">{{ getActivityIcon(activity.type) }}</mat-icon>
                      <div class="activity-content">
                        <span class="activity-text">{{ activity.text }}</span>
                        <span class="activity-time">{{ activity.time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Permissions">
                <div class="tab-content">
                  <h3>Rôle: {{ user.role }}</h3>
                  <div class="permissions-list">
                    <div class="permission-group" *ngFor="let group of permissions">
                      <h4>{{ group.module }}</h4>
                      <div class="permission-items">
                        <span class="permission" *ngFor="let perm of group.permissions">
                          <mat-icon>check</mat-icon> {{ perm }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Sessions">
                <div class="tab-content">
                  <table mat-table [dataSource]="sessions">
                    <ng-container matColumnDef="device">
                      <th mat-header-cell *matHeaderCellDef>Appareil</th>
                      <td mat-cell *matCellDef="let s">
                        <div class="device-info">
                          <mat-icon>{{ s.device === 'desktop' ? 'computer' : 'smartphone' }}</mat-icon>
                          <span>{{ s.browser }}</span>
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="ip">
                      <th mat-header-cell *matHeaderCellDef>Adresse IP</th>
                      <td mat-cell *matCellDef="let s">{{ s.ip }}</td>
                    </ng-container>
                    <ng-container matColumnDef="location">
                      <th mat-header-cell *matHeaderCellDef>Localisation</th>
                      <td mat-cell *matCellDef="let s">{{ s.location }}</td>
                    </ng-container>
                    <ng-container matColumnDef="lastActive">
                      <th mat-header-cell *matHeaderCellDef>Dernière activité</th>
                      <td mat-cell *matCellDef="let s">{{ s.lastActive }}</td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let s">
                        <button mat-icon-button color="warn" *ngIf="s.current !== true">
                          <mat-icon>logout</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="sessionColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: sessionColumns;"></tr>
                  </table>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-detail { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; .header-content { flex: 1; display: flex; align-items: center; gap: 16px; h1 { margin: 0; } } .header-actions { display: flex; align-items: center; gap: 8px; } }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; &.active { background: #e8f5e9; color: #2e7d32; } &.inactive { background: #ffebee; color: #c62828; } }
    .user-content { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
    .profile-card { padding: 24px; text-align: center; .avatar-large { width: 80px; height: 80px; border-radius: 50%; background: #1976d2; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 500; margin: 0 auto 16px; } h2 { margin: 0 0 4px; } .job-title { margin: 0; font-weight: 500; } .organization { margin: 0 0 12px; color: #757575; } mat-chip { margin-bottom: 16px; } mat-divider { margin: 16px 0; } .contact-info { text-align: left; .info-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; mat-icon { color: #757575; } } } .account-info { text-align: left; .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; .label { color: #757575; } mat-icon { font-size: 20px; width: 20px; height: 20px; color: #757575; &.verified { color: #4caf50; } } } } }
    .details-section mat-card { padding: 0; }
    .tab-content { padding: 24px; }
    .activity-list { .activity-item { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e0e0e0; &:last-child { border-bottom: none; } mat-icon { &.login { color: #4caf50; } &.action { color: #2196f3; } &.error { color: #f44336; } } .activity-content { flex: 1; display: flex; justify-content: space-between; .activity-time { color: #757575; font-size: 12px; } } } }
    .permissions-list { .permission-group { margin-bottom: 24px; h4 { margin: 0 0 12px; color: #1976d2; } .permission-items { display: flex; flex-wrap: wrap; gap: 12px; .permission { display: flex; align-items: center; gap: 4px; font-size: 14px; mat-icon { font-size: 16px; width: 16px; height: 16px; color: #4caf50; } } } } }
    table { width: 100%; }
    .device-info { display: flex; align-items: center; gap: 8px; }
    .warn { color: #f44336; }
    @media (max-width: 1024px) { .user-content { grid-template-columns: 1fr; } }
  `]
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  userId = '';
  sessionColumns = ['device', 'ip', 'location', 'lastActive', 'actions'];

  user = {
    id: '1',
    name: 'Jean Dupont',
    initials: 'JD',
    email: 'jean.dupont@example.com',
    phone: '+237 612 345 678',
    organization: 'Import Export SARL',
    role: 'Opérateur Économique',
    jobTitle: 'Responsable Import',
    status: 'active',
    language: 'fr',
    createdAt: '2023-06-15',
    lastLogin: '2024-01-15 09:30',
    emailVerified: true,
    twoFactorEnabled: false
  };

  activities = [
    { type: 'login', text: 'Connexion depuis Chrome/Windows', time: 'Il y a 2 heures' },
    { type: 'action', text: 'Création déclaration DI-2024-00156', time: 'Il y a 3 heures' },
    { type: 'action', text: 'Téléchargement attestation', time: 'Il y a 5 heures' },
    { type: 'login', text: 'Connexion depuis Chrome/Windows', time: 'Hier 14:30' },
    { type: 'error', text: 'Échec authentification (mot de passe incorrect)', time: 'Il y a 3 jours' }
  ];

  permissions = [
    { module: 'Déclarations', permissions: ['Créer', 'Modifier', 'Soumettre', 'Annuler'] },
    { module: 'Documents', permissions: ['Téléverser', 'Télécharger', 'Supprimer'] },
    { module: 'Paiements', permissions: ['Effectuer', 'Consulter historique'] },
    { module: 'Profil', permissions: ['Modifier', 'Changer mot de passe'] }
  ];

  sessions = [
    { device: 'desktop', browser: 'Chrome 120 / Windows 11', ip: '192.168.1.100', location: 'Douala, CM', lastActive: 'Actif maintenant', current: true },
    { device: 'mobile', browser: 'Safari / iOS 17', ip: '192.168.1.105', location: 'Yaoundé, CM', lastActive: 'Il y a 2 jours', current: false }
  ];

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Actif' : 'Inactif';
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = { login: 'login', action: 'touch_app', error: 'error' };
    return icons[type] || 'info';
  }
}
