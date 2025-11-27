import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'hub-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="profile-container">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-banner"></div>
        <div class="profile-info">
          <div class="avatar">
            <span>{{ userInitials() }}</span>
            <button class="avatar-edit" matTooltip="Modifier la photo">
              <mat-icon>photo_camera</mat-icon>
            </button>
          </div>
          <div class="user-details">
            <h1>{{ userName() }}</h1>
            <p class="email">{{ userEmail() }}</p>
            <div class="roles">
              <mat-chip *ngFor="let role of userRoles()">{{ formatRole(role) }}</mat-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <mat-tab-group class="profile-tabs" animationDuration="200ms">
        <!-- General Info -->
        <mat-tab label="Informations Generales">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Informations Personnelles</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Prenom</mat-label>
                      <input matInput formControlName="firstName">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nom</mat-label>
                      <input matInput formControlName="lastName">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Telephone</mat-label>
                      <input matInput formControlName="phone">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Organisation</mat-label>
                      <input matInput formControlName="organization" readonly>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-stroked-button type="button" (click)="resetForm()">
                      Annuler
                    </button>
                    <button mat-raised-button color="primary" type="submit"
                            [disabled]="!profileForm.valid || !profileForm.dirty">
                      Enregistrer
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security -->
        <mat-tab label="Securite">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Mot de Passe</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="security-info">
                  La gestion du mot de passe est geree par le service d'authentification central (Keycloak).
                </p>
                <button mat-raised-button color="primary" (click)="changePassword()">
                  <mat-icon>lock</mat-icon>
                  Modifier le mot de passe
                </button>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Sessions Actives</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="session-list">
                  <div class="session-item current">
                    <div class="session-icon">
                      <mat-icon>computer</mat-icon>
                    </div>
                    <div class="session-info">
                      <h4>Session actuelle</h4>
                      <p>Navigateur web - {{ currentBrowser }}</p>
                      <span class="session-time">Active maintenant</span>
                    </div>
                    <span class="session-badge">Actuelle</span>
                  </div>
                </div>
                <button mat-stroked-button color="warn" class="logout-all-btn" (click)="logoutAllSessions()">
                  <mat-icon>logout</mat-icon>
                  Deconnecter toutes les sessions
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Preferences -->
        <mat-tab label="Preferences">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Preferences d'Affichage</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="preference-item">
                  <div class="preference-info">
                    <h4>Theme</h4>
                    <p>Choisissez le theme de l'interface</p>
                  </div>
                  <div class="theme-selector">
                    <button mat-stroked-button [class.active]="theme() === 'light'" (click)="setTheme('light')">
                      <mat-icon>light_mode</mat-icon>
                      Clair
                    </button>
                    <button mat-stroked-button [class.active]="theme() === 'dark'" (click)="setTheme('dark')">
                      <mat-icon>dark_mode</mat-icon>
                      Sombre
                    </button>
                    <button mat-stroked-button [class.active]="theme() === 'auto'" (click)="setTheme('auto')">
                      <mat-icon>brightness_auto</mat-icon>
                      Auto
                    </button>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="preference-item">
                  <div class="preference-info">
                    <h4>Langue</h4>
                    <p>Selectionnez la langue de l'interface</p>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-select [(value)]="selectedLanguage">
                      <mat-option value="fr">Francais</mat-option>
                      <mat-option value="en">English</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <div class="preference-item">
                  <div class="preference-info">
                    <h4>Notifications</h4>
                    <p>Gerez vos preferences de notification</p>
                  </div>
                  <button mat-stroked-button routerLink="/admin/settings/notifications">
                    Configurer
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Activity -->
        <mat-tab label="Activite">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Activite Recente</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="activity-timeline">
                  <div class="activity-item" *ngFor="let activity of recentActivity">
                    <div class="activity-icon" [ngClass]="activity.type">
                      <mat-icon>{{ activity.icon }}</mat-icon>
                    </div>
                    <div class="activity-content">
                      <p>{{ activity.description }}</p>
                      <span class="activity-time">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
    }

    .profile-banner {
      height: 160px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    }

    .profile-info {
      display: flex;
      align-items: flex-end;
      gap: 24px;
      padding: 0 32px 24px;
      margin-top: -60px;
    }

    .avatar {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 700;
      color: white;
      border: 4px solid white;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);

      .avatar-edit {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.2s;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #64748b;
        }

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .user-details {
      flex: 1;
      padding-bottom: 8px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px;
      }

      .email {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 12px;
      }

      .roles {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        mat-chip {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          font-size: 12px;
        }
      }
    }

    .profile-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }
    }

    .tab-content {
      padding: 24px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    mat-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    mat-card-header {
      padding: 20px 24px 0;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
    }

    mat-card-content {
      padding: 20px 24px 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .full-width {
        grid-column: span 2;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .security-info {
      color: #64748b;
      margin-bottom: 16px;
    }

    .session-list {
      margin-bottom: 24px;
    }

    .session-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;

      &.current {
        border: 2px solid #6366f1;
        background: rgba(99, 102, 241, 0.05);
      }
    }

    .session-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }

    .session-info {
      flex: 1;

      h4 {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #64748b;
      }

      .session-time {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    .session-badge {
      padding: 4px 12px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .logout-all-btn {
      margin-top: 16px;
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;

      .preference-info {
        h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
      }
    }

    .theme-selector {
      display: flex;
      gap: 8px;

      button {
        &.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }
      }
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      transition: background 0.2s;

      &:hover {
        background: #f8fafc;
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.login {
        background: #dbeafe;
        color: #2563eb;
      }

      &.action {
        background: #dcfce7;
        color: #16a34a;
      }

      &.create {
        background: #fef3c7;
        color: #d97706;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .activity-content {
      flex: 1;

      p {
        margin: 0;
        font-size: 14px;
        color: #0f172a;
      }

      .activity-time {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    @media (max-width: 768px) {
      .profile-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: -50px;
      }

      .avatar {
        width: 100px;
        height: 100px;
        font-size: 28px;
      }

      .user-details {
        .roles {
          justify-content: center;
        }
      }

      .form-grid {
        grid-template-columns: 1fr;

        .full-width {
          grid-column: span 1;
        }
      }

      .preference-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private keycloak = inject(KeycloakService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  userName = signal('');
  userEmail = signal('');
  userInitials = signal('');
  userRoles = signal<string[]>([]);
  theme = signal('light');
  selectedLanguage = 'fr';
  currentBrowser = 'Chrome';

  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    organization: ['']
  });

  recentActivity = [
    { type: 'login', icon: 'login', description: 'Connexion depuis Chrome sur Windows', time: 'Il y a 5 minutes' },
    { type: 'action', icon: 'check_circle', description: 'Tenant "GUCE-CM" mis a jour', time: 'Il y a 2 heures' },
    { type: 'create', icon: 'add_circle', description: 'Nouveau workflow cree: "Import Douanier"', time: 'Hier' },
    { type: 'action', icon: 'settings', description: 'Parametres de securite modifies', time: 'Il y a 3 jours' }
  ];

  async ngOnInit() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName.set(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Utilisateur');
      this.userEmail.set(profile.email || '');
      this.userInitials.set(`${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U');
      this.userRoles.set(this.keycloak.getUserRoles());

      this.profileForm.patchValue({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        organization: 'GUCE Cameroun'
      });

      // Detect browser
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) this.currentBrowser = 'Chrome';
      else if (ua.includes('Firefox')) this.currentBrowser = 'Firefox';
      else if (ua.includes('Safari')) this.currentBrowser = 'Safari';
      else if (ua.includes('Edge')) this.currentBrowser = 'Edge';

      // Load theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.theme.set(savedTheme);
      }
    } catch {
      this.userName.set('Utilisateur');
      this.userInitials.set('U');
    }
  }

  formatRole(role: string): string {
    return role.replace('HUB_', '').replace(/_/g, ' ');
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.snackBar.open('Profil mis a jour avec succes', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.profileForm.markAsPristine();
    }
  }

  resetForm() {
    this.ngOnInit();
    this.profileForm.markAsPristine();
  }

  changePassword() {
    // Redirect to Keycloak account management
    const accountUrl = this.keycloak.getKeycloakInstance().createAccountUrl();
    window.location.href = accountUrl;
  }

  logoutAllSessions() {
    this.keycloak.logout(window.location.origin);
  }

  setTheme(theme: string) {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
