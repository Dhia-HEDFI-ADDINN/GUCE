import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'hub-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()">
          <mat-icon>menu</mat-icon>
        </button>
        <div class="breadcrumb">
          <span class="hub-name">E-GUCE 3G Generator Hub</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Search -->
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Rechercher..." />
        </div>

        <!-- Notifications -->
        <button class="icon-btn" [matMenuTriggerFor]="notifMenu">
          <mat-icon [matBadge]="notificationCount" matBadgeColor="warn" [matBadgeHidden]="notificationCount === 0">
            notifications
          </mat-icon>
        </button>
        <mat-menu #notifMenu="matMenu" class="notification-menu">
          <div class="menu-header">
            <span>Notifications</span>
            <a href="#">Tout marquer comme lu</a>
          </div>
          <div class="notification-list">
            <div class="notification-item" *ngFor="let notif of notifications">
              <mat-icon [class]="notif.type">{{ getNotifIcon(notif.type) }}</mat-icon>
              <div class="notif-content">
                <p class="notif-title">{{ notif.title }}</p>
                <p class="notif-time">{{ notif.time }}</p>
              </div>
            </div>
            <div class="no-notifications" *ngIf="notifications.length === 0">
              Aucune notification
            </div>
          </div>
        </mat-menu>

        <!-- User Menu -->
        <button class="user-btn" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/admin/settings/general">
            <mat-icon>settings</mat-icon>
            <span>Parametres</span>
          </button>
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

    .breadcrumb {
      .hub-name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      padding: 8px 16px;
      border-radius: 24px;
      min-width: 240px;

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

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #616161;

      &:hover {
        background: #f5f5f5;
      }
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;

      &:hover {
        background: #f5f5f5;
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a237e, #0d47a1);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .user-role {
        font-size: 12px;
        color: #757575;
      }
    }

    ::ng-deep .notification-menu {
      .menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;

        span {
          font-weight: 500;
        }

        a {
          font-size: 12px;
          color: #1a237e;
          text-decoration: none;
        }
      }

      .notification-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .notification-item {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
        }

        mat-icon {
          &.success { color: #2e7d32; }
          &.warning { color: #f57c00; }
          &.error { color: #c62828; }
          &.info { color: #1565c0; }
        }

        .notif-content {
          flex: 1;

          .notif-title {
            font-size: 13px;
            color: #333;
            margin: 0 0 4px 0;
          }

          .notif-time {
            font-size: 11px;
            color: #9e9e9e;
            margin: 0;
          }
        }
      }

      .no-notifications {
        padding: 24px;
        text-align: center;
        color: #9e9e9e;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);

  userName = '';
  userRole = '';
  userInitials = '';
  notificationCount = 3;

  notifications = [
    { type: 'success', title: 'GUCE Cameroun deploye avec succes', time: 'Il y a 5 min' },
    { type: 'warning', title: 'GUCE Tchad: CPU a 85%', time: 'Il y a 15 min' },
    { type: 'info', title: 'Nouveau template disponible', time: 'Il y a 1h' }
  ];

  async ngOnInit() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName} ${profile.lastName}`;
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

      const roles = this.keycloak.getUserRoles();
      if (roles.includes('HUB_SUPER_ADMIN')) {
        this.userRole = 'Super Admin';
      } else if (roles.includes('HUB_TENANT_MANAGER')) {
        this.userRole = 'Tenant Manager';
      } else if (roles.includes('HUB_MONITORING_VIEWER')) {
        this.userRole = 'Monitoring Viewer';
      } else {
        this.userRole = 'Utilisateur';
      }
    } catch {
      this.userName = 'Utilisateur';
      this.userInitials = 'U';
      this.userRole = 'Utilisateur';
    }
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }
}
