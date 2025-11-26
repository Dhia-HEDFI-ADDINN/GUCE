import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { KeycloakService } from 'keycloak-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '@core/services/notification.service';
import { Notification, NotificationLevel } from '@core/models/notification.model';

@Component({
  selector: 'hub-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatRippleModule
  ],
  template: `
    <header class="header" [class.scrolled]="scrolled">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()" matTooltip="Menu">
          <mat-icon>{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</mat-icon>
        </button>

        <!-- Breadcrumb / Title -->
        <div class="header-title">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="breadcrumb" *ngIf="breadcrumbs.length > 0">
            <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
              <a [routerLink]="crumb.route" *ngIf="!last">{{ crumb.label }}</a>
              <span *ngIf="!last" class="separator">/</span>
              <span *ngIf="last" class="current">{{ crumb.label }}</span>
            </ng-container>
          </div>
        </div>
      </div>

      <div class="header-center">
        <!-- Global Search -->
        <div class="search-container" [class.focused]="searchFocused">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text"
                 class="search-input"
                 placeholder="Rechercher tenants, procedures, utilisateurs..."
                 [(ngModel)]="searchQuery"
                 (focus)="searchFocused = true"
                 (blur)="searchFocused = false"
                 (keydown.escape)="clearSearch()" />
          <div class="search-shortcut" *ngIf="!searchQuery && !searchFocused">
            <kbd>Ctrl</kbd><kbd>K</kbd>
          </div>
          <button class="search-clear" *ngIf="searchQuery" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <div class="header-right">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="action-btn" matTooltip="Nouveau tenant" [matMenuTriggerFor]="createMenu">
            <mat-icon>add</mat-icon>
          </button>
          <mat-menu #createMenu="matMenu" class="create-menu">
            <button mat-menu-item routerLink="/tenants/create">
              <mat-icon>apartment</mat-icon>
              <span>Nouveau Tenant</span>
            </button>
            <button mat-menu-item routerLink="/templates/forms">
              <mat-icon>dynamic_form</mat-icon>
              <span>Nouveau Formulaire</span>
            </button>
            <button mat-menu-item routerLink="/templates/workflows">
              <mat-icon>account_tree</mat-icon>
              <span>Nouveau Workflow</span>
            </button>
          </mat-menu>
        </div>

        <!-- Divider -->
        <div class="header-divider"></div>

        <!-- Notifications -->
        <button class="icon-btn notification-btn"
                [matMenuTriggerFor]="notifMenu"
                [class.has-notifications]="unreadCount > 0"
                matTooltip="Notifications">
          <mat-icon [matBadge]="unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null"
                    matBadgeColor="warn"
                    matBadgeSize="small">
            notifications
          </mat-icon>
          <span class="notification-pulse" *ngIf="unreadCount > 0"></span>
        </button>

        <mat-menu #notifMenu="matMenu" class="notification-menu" xPosition="before">
          <div class="notif-panel" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="notif-header">
              <h3>Notifications</h3>
              <div class="notif-actions">
                <button class="btn-text" *ngIf="unreadCount > 0" (click)="markAllRead()">
                  Tout marquer lu
                </button>
                <a routerLink="/admin/settings/notifications" class="btn-icon" matTooltip="Parametres">
                  <mat-icon>settings</mat-icon>
                </a>
              </div>
            </div>

            <!-- Filter tabs -->
            <div class="notif-tabs">
              <button [class.active]="notifFilter === 'all'" (click)="notifFilter = 'all'">
                Tout
              </button>
              <button [class.active]="notifFilter === 'unread'" (click)="notifFilter = 'unread'">
                Non lues
                <span class="count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </button>
            </div>

            <!-- Notifications list -->
            <div class="notif-list" *ngIf="filteredNotifications.length > 0">
              <div class="notif-item"
                   *ngFor="let notif of filteredNotifications"
                   [class.unread]="!notif.read"
                   (click)="handleNotifClick(notif)">
                <div class="notif-icon" [class]="'level-' + notif.level.toLowerCase()">
                  <mat-icon>{{ notif.icon || getLevelIcon(notif.level) }}</mat-icon>
                </div>
                <div class="notif-content">
                  <div class="notif-title-row">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ getTimeAgo(notif.createdAt) }}</span>
                  </div>
                  <p class="notif-message">{{ notif.message }}</p>
                  <a *ngIf="notif.actionUrl" [routerLink]="notif.actionUrl" class="notif-action">
                    {{ notif.actionLabel || 'Voir' }}
                    <mat-icon>chevron_right</mat-icon>
                  </a>
                </div>
                <button class="notif-dismiss" (click)="dismissNotif(notif, $event)" matTooltip="Supprimer">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div class="notif-empty" *ngIf="filteredNotifications.length === 0">
              <mat-icon>notifications_off</mat-icon>
              <p>{{ notifFilter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification' }}</p>
            </div>

            <!-- Footer -->
            <div class="notif-footer">
              <a routerLink="/notifications">
                Voir toutes les notifications
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </mat-menu>

        <!-- Help -->
        <button class="icon-btn" [matMenuTriggerFor]="helpMenu" matTooltip="Aide">
          <mat-icon>help_outline</mat-icon>
        </button>
        <mat-menu #helpMenu="matMenu">
          <a mat-menu-item href="https://docs.e-guce.com" target="_blank">
            <mat-icon>menu_book</mat-icon>
            <span>Documentation</span>
          </a>
          <a mat-menu-item href="https://support.e-guce.com" target="_blank">
            <mat-icon>support_agent</mat-icon>
            <span>Support</span>
          </a>
          <button mat-menu-item>
            <mat-icon>keyboard</mat-icon>
            <span>Raccourcis clavier</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item>
            <mat-icon>info</mat-icon>
            <span>A propos</span>
          </button>
        </mat-menu>

        <!-- Divider -->
        <div class="header-divider"></div>

        <!-- User Menu -->
        <button class="user-btn" [matMenuTriggerFor]="userMenu" matRipple>
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
            <span class="status-dot online"></span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" class="user-menu" xPosition="before">
          <div class="user-menu-header">
            <div class="user-avatar large">
              <span>{{ userInitials }}</span>
            </div>
            <div class="user-details">
              <span class="name">{{ userName }}</span>
              <span class="email">{{ userEmail }}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Mon profil</span>
          </button>
          <button mat-menu-item routerLink="/admin/settings/general">
            <mat-icon>settings</mat-icon>
            <span>Parametres</span>
          </button>
          <button mat-menu-item (click)="toggleTheme()">
            <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
            <span>{{ isDarkMode ? 'Mode clair' : 'Mode sombre' }}</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Deconnexion</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      --header-height: 72px;
      --header-bg: rgba(255, 255, 255, 0.85);
      --header-border: rgba(0, 0, 0, 0.06);
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --accent-color: #6366f1;
      --accent-light: rgba(99, 102, 241, 0.1);
    }

    .header {
      height: var(--header-height);
      background: var(--header-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--header-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      transition: all 0.3s ease;

      &.scrolled {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle {
      width: 40px;
      height: 40px;
      background: none;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--accent-light);
        color: var(--accent-color);
      }

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .header-title {
      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.2;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        margin-top: 2px;

        a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;

          &:hover {
            color: var(--accent-color);
          }
        }

        .separator {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .current {
          color: var(--accent-color);
          font-weight: 500;
        }
      }
    }

    .header-center {
      flex: 1;
      max-width: 560px;
      margin: 0 24px;
    }

    .search-container {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f1f5f9;
      border: 2px solid transparent;
      border-radius: 14px;
      padding: 10px 16px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: #e2e8f0;
      }

      &.focused {
        background: white;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 4px var(--accent-light);
      }

      .search-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-secondary);
      }

      .search-input {
        flex: 1;
        border: none;
        background: none;
        outline: none;
        font-size: 14px;
        color: var(--text-primary);
        font-family: inherit;

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .search-shortcut {
        display: flex;
        gap: 4px;

        kbd {
          padding: 3px 6px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
          color: var(--text-secondary);
        }
      }

      .search-clear {
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);

        &:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-divider {
      width: 1px;
      height: 24px;
      background: var(--header-border);
      margin: 0 8px;
    }

    .quick-actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      background: var(--accent-color);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      background: none;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      position: relative;
      transition: all 0.2s;

      &:hover {
        background: var(--accent-light);
        color: var(--accent-color);
      }

      &.notification-btn.has-notifications {
        color: var(--accent-color);
      }

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .notification-pulse {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 12px 6px 6px;
      border-radius: 12px;
      transition: all 0.2s;

      &:hover {
        background: var(--accent-light);
      }
    }

    .user-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: white;

      &.large {
        width: 48px;
        height: 48px;
        font-size: 16px;
      }

      .status-dot {
        position: absolute;
        bottom: -1px;
        right: -1px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;

        &.online { background: #10b981; }
        &.away { background: #f59e0b; }
        &.offline { background: #94a3b8; }
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .user-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .user-role {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
      transition: transform 0.2s;
    }

    /* Notification Panel Styles */
    ::ng-deep .notification-menu {
      .mat-mdc-menu-content {
        padding: 0 !important;
      }
    }

    .notif-panel {
      width: 420px;
      max-height: 540px;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .notif-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-text {
        background: none;
        border: none;
        color: var(--accent-color);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.2s;

        &:hover {
          background: var(--accent-light);
        }
      }

      .btn-icon {
        width: 28px;
        height: 28px;
        background: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        text-decoration: none;

        &:hover {
          background: #f1f5f9;
          color: var(--text-primary);
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .notif-tabs {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-bottom: 1px solid #f1f5f9;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: #f1f5f9;
        border: none;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #e2e8f0;
        }

        &.active {
          background: var(--accent-color);
          color: white;
        }

        .count {
          padding: 2px 6px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        &.active .count {
          background: white;
          color: var(--accent-color);
        }
      }
    }

    .notif-list {
      flex: 1;
      overflow-y: auto;
      max-height: 340px;
    }

    .notif-item {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
      border-bottom: 1px solid #f8fafc;

      &:hover {
        background: #f8fafc;

        .notif-dismiss {
          opacity: 1;
        }
      }

      &.unread {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--accent-color);
        }
      }
    }

    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.level-info {
        background: #dbeafe;
        color: #2563eb;
      }

      &.level-success {
        background: #dcfce7;
        color: #16a34a;
      }

      &.level-warning {
        background: #fef3c7;
        color: #d97706;
      }

      &.level-error {
        background: #fee2e2;
        color: #dc2626;
      }

      &.level-critical {
        background: #fce7f3;
        color: #db2777;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 4px;
    }

    .notif-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .notif-time {
      font-size: 11px;
      color: var(--text-secondary);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notif-message {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .notif-action {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      margin-top: 6px;
      font-size: 11px;
      font-weight: 500;
      color: var(--accent-color);
      text-decoration: none;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .notif-dismiss {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      opacity: 0;
      transition: all 0.2s;

      &:hover {
        background: #fee2e2;
        border-color: #fecaca;
        color: #dc2626;
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--text-secondary);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      p {
        font-size: 13px;
        margin: 0;
      }
    }

    .notif-footer {
      padding: 14px 20px;
      border-top: 1px solid #f1f5f9;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--accent-color);
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: #4338ca;
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    /* User Menu Styles */
    ::ng-deep .user-menu {
      .mat-mdc-menu-content {
        padding: 0 !important;
      }

      .mat-mdc-menu-item {
        min-height: 44px;
      }
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--accent-light) 0%, rgba(139, 92, 246, 0.1) 100%);

      .user-details {
        .name {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .email {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    ::ng-deep .logout-btn {
      color: #dc2626 !important;

      mat-icon {
        color: #dc2626 !important;
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .header-center {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 0 16px;
      }

      .header-title .breadcrumb {
        display: none;
      }

      .user-info {
        display: none;
      }

      .dropdown-icon {
        display: none;
      }

      .notif-panel {
        width: 340px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed = false;
  @Input() pageTitle = 'Dashboard';
  @Input() breadcrumbs: Array<{ label: string; route?: string }> = [];
  @Output() toggleSidebar = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  userName = '';
  userRole = '';
  userEmail = '';
  userInitials = '';
  searchQuery = '';
  searchFocused = false;
  scrolled = false;
  isDarkMode = false;

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  notifFilter: 'all' | 'unread' = 'all';

  async ngOnInit() {
    // Load user info
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Utilisateur';
      this.userEmail = profile.email || '';
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

      const roles = this.keycloak.getUserRoles();
      if (roles.includes('HUB_SUPER_ADMIN')) {
        this.userRole = 'Super Admin';
      } else if (roles.includes('HUB_TENANT_MANAGER')) {
        this.userRole = 'Tenant Manager';
      } else if (roles.includes('HUB_MONITORING_VIEWER')) {
        this.userRole = 'Monitoring';
      } else {
        this.userRole = 'Utilisateur';
      }
    } catch {
      this.userName = 'Utilisateur';
      this.userInitials = 'U';
      this.userRole = 'Utilisateur';
    }

    // Subscribe to notifications
    this.notificationService.getNotificationsStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyNotifFilter();
      });

    this.notificationService.getUnreadCountStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount = count);

    // Load notifications
    this.notificationService.getAll().subscribe();

    // Track scroll
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // Check dark mode
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  handleScroll() {
    this.scrolled = window.scrollY > 10;
  }

  clearSearch() {
    this.searchQuery = '';
  }

  applyNotifFilter() {
    if (this.notifFilter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.read);
    } else {
      this.filteredNotifications = this.notifications;
    }
  }

  handleNotifClick(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  dismissNotif(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.dismiss(notification.id).subscribe();
  }

  getLevelIcon(level: NotificationLevel): string {
    const icons: Record<NotificationLevel, string> = {
      [NotificationLevel.INFO]: 'info',
      [NotificationLevel.SUCCESS]: 'check_circle',
      [NotificationLevel.WARNING]: 'warning',
      [NotificationLevel.ERROR]: 'error',
      [NotificationLevel.CRITICAL]: 'dangerous'
    };
    return icons[level];
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return past.toLocaleDateString('fr-FR');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
