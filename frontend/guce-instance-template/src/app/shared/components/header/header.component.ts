import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '@env/environment';

@Component({
  selector: 'guce-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <header class="header" [style.--primary-color]="primaryColor">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()">
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Breadcrumb / Current Portal -->
        <div class="current-context">
          <span class="portal-name" *ngIf="currentPortal">{{ currentPortal }}</span>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
      </div>

      <div class="header-center">
        <!-- Global Search -->
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text"
                 placeholder="Rechercher declarations, dossiers, documents..."
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="search()" />
        </div>
      </div>

      <div class="header-right">
        <!-- Quick Actions -->
        <button class="action-btn" matTooltip="Nouvelle declaration" (click)="newDeclaration()">
          <mat-icon>add_circle</mat-icon>
        </button>

        <!-- Notifications -->
        <button class="action-btn" [matMenuTriggerFor]="notifMenu">
          <mat-icon [matBadge]="unreadNotifications" matBadgeColor="warn" [matBadgeHidden]="unreadNotifications === 0">
            notifications
          </mat-icon>
        </button>
        <mat-menu #notifMenu="matMenu" class="notification-menu">
          <div class="menu-header">
            <span>Notifications</span>
            <a (click)="markAllAsRead()">Tout marquer comme lu</a>
          </div>
          <div class="notification-list">
            <div class="notification-item" *ngFor="let notif of notifications" (click)="openNotification(notif)">
              <mat-icon [class]="notif.type">{{ getNotifIcon(notif.type) }}</mat-icon>
              <div class="notif-content">
                <p class="notif-title">{{ notif.title }}</p>
                <p class="notif-message">{{ notif.message }}</p>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
            </div>
            <div class="no-notifications" *ngIf="notifications.length === 0">
              <mat-icon>notifications_none</mat-icon>
              <p>Aucune notification</p>
            </div>
          </div>
          <div class="menu-footer">
            <a routerLink="/e-force/notifications">Voir toutes les notifications</a>
          </div>
        </mat-menu>

        <!-- Help -->
        <button class="action-btn" matTooltip="Aide" (click)="openHelp()">
          <mat-icon>help_outline</mat-icon>
        </button>

        <!-- Language -->
        <button class="action-btn" [matMenuTriggerFor]="langMenu">
          <span class="lang-code">{{ currentLang }}</span>
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item (click)="setLanguage('fr')">
            <span>Francais</span>
          </button>
          <button mat-menu-item (click)="setLanguage('en')">
            <span>English</span>
          </button>
        </mat-menu>

        <!-- User Menu -->
        <button class="user-btn" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar" [style.background]="primaryColor">
            {{ userInitials }}
          </div>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-menu-header">
            <div class="user-avatar large" [style.background]="primaryColor">
              {{ userInitials }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span class="user-email">{{ userEmail }}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/e-force/profile">
            <mat-icon>person</mat-icon>
            <span>Mon profil</span>
          </button>
          <button mat-menu-item routerLink="/admin/settings/general" *ngIf="isAdmin">
            <mat-icon>settings</mat-icon>
            <span>Parametres</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Deconnexion</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #616161;

      &:hover {
        background: #f5f5f5;
      }
    }

    .current-context {
      display: flex;
      flex-direction: column;

      .portal-name {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--primary-color, #1a237e);
        font-weight: 600;
      }

      .page-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .header-center {
      flex: 1;
      max-width: 500px;
      margin: 0 24px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      padding: 10px 16px;
      border-radius: 24px;
      width: 100%;

      mat-icon {
        color: #9e9e9e;
        font-size: 20px;
      }

      input {
        border: none;
        background: none;
        outline: none;
        font-size: 14px;
        width: 100%;

        &::placeholder {
          color: #9e9e9e;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #616161;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f5f5f5;
        color: var(--primary-color, #1a237e);
      }

      .lang-code {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
      }
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px 4px 4px;
      border-radius: 24px;

      &:hover {
        background: #f5f5f5;
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;

      &.large {
        width: 48px;
        height: 48px;
        font-size: 18px;
      }
    }

    ::ng-deep .notification-menu {
      width: 360px;

      .menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;

        span {
          font-weight: 600;
          font-size: 16px;
        }

        a {
          font-size: 13px;
          color: var(--primary-color, #1a237e);
          cursor: pointer;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .notification-list {
        max-height: 320px;
        overflow-y: auto;
      }

      .notification-item {
        display: flex;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
        }

        mat-icon {
          flex-shrink: 0;
          &.success { color: #4caf50; }
          &.warning { color: #ff9800; }
          &.error { color: #f44336; }
          &.info { color: #2196f3; }
        }

        .notif-content {
          flex: 1;
          min-width: 0;

          .notif-title {
            font-weight: 500;
            font-size: 14px;
            margin: 0 0 2px;
            color: #333;
          }

          .notif-message {
            font-size: 13px;
            color: #757575;
            margin: 0 0 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .notif-time {
            font-size: 11px;
            color: #9e9e9e;
          }
        }
      }

      .no-notifications {
        padding: 32px;
        text-align: center;
        color: #9e9e9e;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
        }

        p {
          margin: 0;
        }
      }

      .menu-footer {
        padding: 12px 16px;
        border-top: 1px solid #e0e0e0;
        text-align: center;

        a {
          color: var(--primary-color, #1a237e);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    ::ng-deep .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;

      .user-details {
        display: flex;
        flex-direction: column;

        .user-name {
          font-weight: 600;
          font-size: 15px;
        }

        .user-email {
          font-size: 13px;
          color: #757575;
        }
      }
    }

    @media (max-width: 768px) {
      .header-center {
        display: none;
      }

      .current-context .page-title {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  primaryColor = environment.branding.primaryColor;
  currentPortal = '';
  pageTitle = 'Tableau de bord';
  searchQuery = '';
  currentLang = 'FR';

  userName = '';
  userEmail = '';
  userInitials = '';
  isAdmin = false;

  unreadNotifications = 5;
  notifications = [
    { type: 'success', title: 'Declaration approuvee', message: 'Votre declaration IMP-2024-001234 a ete approuvee', time: 'Il y a 5 min' },
    { type: 'warning', title: 'Document manquant', message: 'Certificat d\'origine requis pour EXP-2024-005678', time: 'Il y a 30 min' },
    { type: 'info', title: 'Nouveau message', message: 'Agent Douanes a commente votre dossier', time: 'Il y a 1h' },
    { type: 'error', title: 'Paiement echoue', message: 'Le paiement pour TRANS-2024-009012 a echoue', time: 'Il y a 2h' },
    { type: 'info', title: 'Mise a jour systeme', message: 'Maintenance prevue ce soir a 22h', time: 'Il y a 3h' }
  ];

  async ngOnInit() {
    await this.loadUserInfo();
    this.updateContext();

    // Listen to route changes
    this.router.events.subscribe(() => {
      this.updateContext();
    });
  }

  async loadUserInfo() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName} ${profile.lastName}`;
      this.userEmail = profile.email || '';
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

      const roles = this.keycloak.getUserRoles();
      this.isAdmin = roles.includes('SUPER_ADMIN_INSTANCE') || roles.includes('ADMIN_FONCTIONNEL');
    } catch {
      this.userName = 'Utilisateur';
      this.userInitials = 'U';
    }
  }

  updateContext() {
    const url = this.router.url;

    if (url.startsWith('/e-force')) {
      this.currentPortal = 'e-Force';
    } else if (url.startsWith('/e-gov')) {
      this.currentPortal = 'e-Gov';
    } else if (url.startsWith('/e-business')) {
      this.currentPortal = 'e-Business';
    } else if (url.startsWith('/e-payment')) {
      this.currentPortal = 'e-Payment';
    } else if (url.startsWith('/config')) {
      this.currentPortal = 'Procedure Builder';
    } else if (url.startsWith('/admin')) {
      this.currentPortal = 'Administration';
    } else {
      this.currentPortal = '';
    }
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  newDeclaration() {
    this.router.navigate(['/e-force/declarations/new/import']);
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  openNotification(notif: any) {
    // Navigate to relevant page based on notification
    console.log('Open notification', notif);
  }

  markAllAsRead() {
    this.unreadNotifications = 0;
  }

  openHelp() {
    window.open('https://docs.guce.cm', '_blank');
  }

  setLanguage(lang: string) {
    this.currentLang = lang.toUpperCase();
    // Implement language change
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
