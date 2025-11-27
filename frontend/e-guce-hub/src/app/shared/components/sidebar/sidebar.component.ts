import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { KeycloakService } from 'keycloak-angular';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
  badge?: number | string;
  badgeColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'hub-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatTooltipModule, MatRippleModule, MatMenuModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed" [class.mobile-open]="mobileOpen">
      <!-- Overlay for mobile -->
      <div class="sidebar-overlay" *ngIf="mobileOpen" (click)="closeMobile()"></div>

      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo" routerLink="/dashboard">
          <div class="logo-icon-wrapper">
            <mat-icon class="logo-icon">hub</mat-icon>
            <span class="logo-pulse"></span>
          </div>
          <div class="logo-text-wrapper" *ngIf="!collapsed">
            <span class="logo-text">E-GUCE</span>
            <span class="logo-subtext">3G HUB</span>
          </div>
        </div>
        <button class="mobile-close" *ngIf="mobileOpen" (click)="closeMobile()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Search (expanded only) -->
      <div class="sidebar-search" *ngIf="!collapsed">
        <div class="search-wrapper">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Rechercher..." [(ngModel)]="searchQuery"
                 (input)="filterMenuItems()" />
          <button class="search-shortcut" *ngIf="!searchQuery">
            <span>⌘K</span>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link"
               matRipple [matRippleColor]="'rgba(255,255,255,0.1)'"
               [matTooltip]="collapsed ? 'Dashboard' : ''" matTooltipPosition="right">
              <div class="nav-icon">
                <mat-icon>space_dashboard</mat-icon>
              </div>
              <span class="nav-label" *ngIf="!collapsed">Dashboard</span>
              <span class="nav-indicator"></span>
            </a>
          </li>

          <!-- Divider -->
          <li class="nav-divider" *ngIf="!collapsed">
            <span>GESTION</span>
          </li>

          <!-- Menu Items -->
          <ng-container *ngFor="let item of filteredMenuItems">
            <li class="nav-item" *ngIf="hasAccess(item.roles)" [@fadeIn]>
              <!-- Without children -->
              <a *ngIf="!item.children"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-link"
                 matRipple [matRippleColor]="'rgba(255,255,255,0.1)'"
                 [matTooltip]="collapsed ? item.label : ''"
                 matTooltipPosition="right">
                <div class="nav-icon">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                <span class="nav-badge" *ngIf="item.badge && !collapsed" [class]="item.badgeColor || 'primary'">
                  {{ item.badge }}
                </span>
                <span class="nav-indicator"></span>
              </a>

              <!-- With children -->
              <ng-container *ngIf="item.children">
                <a class="nav-link has-children"
                   (click)="toggleExpand(item)"
                   [class.expanded]="item.expanded"
                   [class.active]="isChildActive(item)"
                   matRipple [matRippleColor]="'rgba(255,255,255,0.1)'"
                   [matTooltip]="collapsed ? item.label : ''"
                   matTooltipPosition="right">
                  <div class="nav-icon">
                    <mat-icon>{{ item.icon }}</mat-icon>
                  </div>
                  <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                  <span class="nav-badge" *ngIf="item.badge && !collapsed" [class]="item.badgeColor || 'primary'">
                    {{ item.badge }}
                  </span>
                  <mat-icon class="expand-icon" *ngIf="!collapsed">
                    {{ item.expanded ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                  <span class="nav-indicator"></span>
                </a>

                <ul class="sub-nav" *ngIf="item.expanded && !collapsed" [@slideDown]>
                  <li *ngFor="let child of item.children">
                    <a [routerLink]="child.route"
                       routerLinkActive="active"
                       class="sub-nav-link"
                       matRipple [matRippleColor]="'rgba(255,255,255,0.08)'"
                       *ngIf="hasAccess(child.roles)">
                      <span class="sub-nav-dot"></span>
                      <span class="sub-nav-label">{{ child.label }}</span>
                      <span class="sub-nav-badge" *ngIf="child.badge" [class]="child.badgeColor || 'primary'">
                        {{ child.badge }}
                      </span>
                    </a>
                  </li>
                </ul>
              </ng-container>
            </li>
          </ng-container>
        </ul>
      </nav>

      <!-- User Section -->
      <div class="sidebar-user" *ngIf="!collapsed">
        <div class="user-card">
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
            <span class="user-status online"></span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <button class="user-menu-btn" [matMenuTriggerFor]="userMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse.emit()"
                [matTooltip]="collapsed ? 'Agrandir' : 'Reduire'" matTooltipPosition="right">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
        <div class="version" *ngIf="!collapsed">
          <span>v3.0.0</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      --sidebar-bg: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      --sidebar-width: 280px;
      --sidebar-collapsed-width: 72px;
      --nav-item-radius: 12px;
      --nav-active-bg: rgba(99, 102, 241, 0.15);
      --nav-hover-bg: rgba(255, 255, 255, 0.05);
      --text-primary: #f8fafc;
      --text-secondary: rgba(248, 250, 252, 0.7);
      --text-muted: rgba(248, 250, 252, 0.4);
      --accent-color: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.4);
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      border-right: 1px solid rgba(255, 255, 255, 0.05);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        pointer-events: none;
      }

      &.collapsed {
        width: var(--sidebar-collapsed-width);

        .sidebar-header {
          padding: 16px;
          justify-content: center;
        }

        .logo-icon-wrapper {
          margin: 0;
        }

        .nav-link {
          padding: 14px;
          justify-content: center;
        }

        .nav-icon {
          margin: 0;
        }
      }
    }

    .sidebar-overlay {
      display: none;
    }

    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.mobile-open {
          transform: translateX(0);
        }
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: -1;
      }

      .mobile-close {
        display: flex !important;
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      position: relative;
      z-index: 1;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }

    .logo-icon-wrapper {
      position: relative;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--accent-glow);

      .logo-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: white;
      }

      .logo-pulse {
        position: absolute;
        inset: -2px;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
        opacity: 0;
        animation: pulse-ring 2s infinite;
      }
    }

    @keyframes pulse-ring {
      0% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0; transform: scale(1.15); }
      100% { opacity: 0; transform: scale(1.15); }
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;

      .logo-text {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.5px;
        background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .logo-subtext {
        font-size: 11px;
        font-weight: 500;
        color: var(--accent-color);
        letter-spacing: 2px;
      }
    }

    .mobile-close {
      display: none;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      align-items: center;
      justify-content: center;
    }

    .sidebar-search {
      padding: 0 16px 16px;
      position: relative;
      z-index: 1;

      .search-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 10px 14px;
        transition: all 0.2s;

        &:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }

        input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 13px;
          color: var(--text-primary);

          &::placeholder {
            color: var(--text-muted);
          }
        }

        .search-shortcut {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          font-size: 11px;
          font-family: inherit;
          cursor: pointer;
        }
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 12px;
      position: relative;
      z-index: 1;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-divider {
      padding: 16px 16px 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .nav-item {
      margin: 2px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--nav-item-radius);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:hover {
        background: var(--nav-hover-bg);
        color: var(--text-primary);

        .nav-icon {
          transform: scale(1.05);
        }
      }

      &.active {
        background: var(--nav-active-bg);
        color: var(--text-primary);

        .nav-icon {
          background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .nav-indicator {
          opacity: 1;
          transform: scaleY(1);
        }
      }

      &.has-children {
        .nav-label {
          flex: 1;
        }
      }

      &.expanded {
        background: var(--nav-hover-bg);
      }
    }

    .nav-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .nav-label {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;

      &.primary {
        background: var(--accent-color);
        color: white;
      }

      &.accent {
        background: #10b981;
        color: white;
      }

      &.warn {
        background: #ef4444;
        color: white;
      }
    }

    .expand-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      transition: transform 0.2s;
    }

    .nav-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 24px;
      background: linear-gradient(180deg, var(--accent-color), #8b5cf6);
      border-radius: 0 3px 3px 0;
      opacity: 0;
      transition: all 0.2s;
    }

    .sub-nav {
      list-style: none;
      padding: 4px 0 4px 20px;
      margin: 0;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 30px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.08);
      }
    }

    .sub-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      font-size: 13px;
      transition: all 0.2s;
      position: relative;

      &:hover {
        background: var(--nav-hover-bg);
        color: var(--text-primary);

        .sub-nav-dot {
          background: var(--accent-color);
          box-shadow: 0 0 8px var(--accent-glow);
        }
      }

      &.active {
        background: var(--nav-active-bg);
        color: var(--text-primary);

        .sub-nav-dot {
          background: var(--accent-color);
          box-shadow: 0 0 8px var(--accent-glow);
        }
      }
    }

    .sub-nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .sub-nav-label {
      flex: 1;
    }

    .sub-nav-badge {
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;

      &.primary { background: var(--accent-color); color: white; }
      &.accent { background: #10b981; color: white; }
      &.warn { background: #ef4444; color: white; }
    }

    .sidebar-user {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
      z-index: 1;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .user-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;

      .user-status {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #0f172a;

        &.online { background: #10b981; }
        &.away { background: #f59e0b; }
        &.offline { background: #6b7280; }
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;

      .user-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
      }
    }

    .user-menu-btn {
      width: 28px;
      height: 28px;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .sidebar-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
      z-index: 1;
    }

    .collapse-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .version {
      font-size: 11px;
      color: var(--text-muted);
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
    }

    /* Animation classes */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 500px; }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() mobileClose = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  userName = '';
  userRole = '';
  userInitials = '';
  searchQuery = '';

  menuItems: MenuItem[] = [
    {
      icon: 'apartment',
      label: 'Tenant Builder',
      route: '/tenants',
      roles: ['HUB_SUPER_ADMIN', 'HUB_TENANT_MANAGER'],
      badge: 'NEW',
      badgeColor: 'accent',
      expanded: false,
      children: [
        { icon: 'view_list', label: 'Liste des Tenants', route: '/tenants/dashboard' },
        { icon: 'add_circle', label: 'Nouveau Tenant', route: '/tenants/create' },
        { icon: 'compare', label: 'Comparer', route: '/tenants/compare' }
      ]
    },
    {
      icon: 'auto_awesome',
      label: 'Generator Engine',
      route: '/generator',
      roles: ['HUB_SUPER_ADMIN', 'HUB_GENERATOR_OPERATOR'],
      expanded: false,
      children: [
        { icon: 'dashboard', label: 'Dashboard', route: '/generator/dashboard' },
        { icon: 'account_tree', label: 'Procedures', route: '/generator/procedures' },
        { icon: 'storage', label: 'Entites', route: '/generator/entities' },
        { icon: 'web', label: 'Frontends', route: '/generator/frontends' },
        { icon: 'cloud', label: 'Infrastructure', route: '/generator/infrastructure' },
        { icon: 'history', label: 'Historique', route: '/generator/history' },
        { icon: 'queue', label: 'File d\'attente', route: '/generator/queue', badge: 3, badgeColor: 'warn' }
      ]
    },
    {
      icon: 'monitoring',
      label: 'Monitoring 360',
      route: '/monitoring',
      roles: ['HUB_SUPER_ADMIN', 'HUB_MONITORING_VIEWER'],
      expanded: false,
      children: [
        { icon: 'dashboard', label: 'Dashboard', route: '/monitoring/dashboard' },
        { icon: 'health_and_safety', label: 'Sante', route: '/monitoring/health/overview' },
        { icon: 'memory', label: 'CPU', route: '/monitoring/resources/cpu' },
        { icon: 'sd_storage', label: 'Memoire', route: '/monitoring/resources/memory' },
        { icon: 'storage', label: 'Stockage', route: '/monitoring/resources/storage' },
        { icon: 'wifi', label: 'Reseau', route: '/monitoring/resources/network' },
        { icon: 'notifications_active', label: 'Alertes', route: '/monitoring/alerts/active', badge: 2, badgeColor: 'warn' },
        { icon: 'assessment', label: 'Rapports', route: '/monitoring/reports/daily' }
      ]
    },
    {
      icon: 'admin_panel_settings',
      label: 'Admin Central',
      route: '/admin',
      roles: ['HUB_SUPER_ADMIN'],
      expanded: false,
      children: [
        { icon: 'people', label: 'Utilisateurs', route: '/admin/users/list' },
        { icon: 'security', label: 'Roles', route: '/admin/roles/list' },
        { icon: 'business', label: 'Organisations', route: '/admin/organizations' },
        { icon: 'receipt_long', label: 'Audit', route: '/admin/audit/actions' },
        { icon: 'payments', label: 'Facturation', route: '/admin/billing/subscriptions' },
        { icon: 'settings', label: 'Parametres', route: '/admin/settings/general' }
      ]
    },
    {
      icon: 'library_books',
      label: 'Templates Library',
      route: '/templates',
      roles: ['HUB_SUPER_ADMIN', 'HUB_TEMPLATE_MANAGER'],
      expanded: false,
      children: [
        { icon: 'import_export', label: 'Import', route: '/templates/procedures/import' },
        { icon: 'upload', label: 'Export', route: '/templates/procedures/export' },
        { icon: 'local_shipping', label: 'Transit', route: '/templates/procedures/transit' },
        { icon: 'account_tree', label: 'Workflows', route: '/templates/workflows' },
        { icon: 'dynamic_form', label: 'Formulaires', route: '/templates/forms' },
        { icon: 'rule', label: 'Regles', route: '/templates/rules' },
        { icon: 'store', label: 'Marketplace', route: '/templates/marketplace' }
      ]
    }
  ];

  filteredMenuItems: MenuItem[] = [];

  async ngOnInit() {
    this.filteredMenuItems = [...this.menuItems];

    // Auto-expand current route section
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.expandCurrentRoute());

    this.expandCurrentRoute();

    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Utilisateur';
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    try {
      const userRoles = this.keycloak.getUserRoles();
      // If no roles returned, show all menus (dev mode)
      if (!userRoles || userRoles.length === 0) return true;
      return roles.some(role => userRoles.includes(role));
    } catch {
      // In case of Keycloak error, show all menus (dev mode)
      return true;
    }
  }

  toggleExpand(item: MenuItem): void {
    if (this.collapsed) {
      this.router.navigate([item.children?.[0]?.route || item.route]);
    } else {
      item.expanded = !item.expanded;
    }
  }

  isChildActive(item: MenuItem): boolean {
    const currentUrl = this.router.url;
    return item.children?.some(child => currentUrl.startsWith(child.route)) || false;
  }

  expandCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      if (item.children?.some(child => currentUrl.startsWith(child.route))) {
        item.expanded = true;
      }
    });
  }

  filterMenuItems(): void {
    if (!this.searchQuery.trim()) {
      this.filteredMenuItems = [...this.menuItems];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredMenuItems = this.menuItems
      .map(item => {
        const matchesLabel = item.label.toLowerCase().includes(query);
        const matchingChildren = item.children?.filter(child =>
          child.label.toLowerCase().includes(query)
        );

        if (matchesLabel || (matchingChildren && matchingChildren.length > 0)) {
          return {
            ...item,
            expanded: true,
            children: matchingChildren && matchingChildren.length > 0 ? matchingChildren : item.children
          };
        }
        return null;
      })
      .filter(item => item !== null) as MenuItem[];
  }

  closeMobile(): void {
    this.mobileClose.emit();
  }
}
