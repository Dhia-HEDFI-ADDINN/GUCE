import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeycloakService } from 'keycloak-angular';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'hub-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo">
          <mat-icon class="logo-icon">hub</mat-icon>
          <span class="logo-text" *ngIf="!collapsed">E-GUCE 3G HUB</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link"
               [matTooltip]="collapsed ? 'Dashboard' : ''" matTooltipPosition="right">
              <mat-icon>dashboard</mat-icon>
              <span class="nav-label" *ngIf="!collapsed">Dashboard</span>
            </a>
          </li>

          <!-- Menu Items -->
          <ng-container *ngFor="let item of menuItems">
            <li class="nav-item" *ngIf="hasAccess(item.roles)">
              <!-- Without children -->
              <a *ngIf="!item.children"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-link"
                 [matTooltip]="collapsed ? item.label : ''"
                 matTooltipPosition="right">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
              </a>

              <!-- With children -->
              <ng-container *ngIf="item.children">
                <a class="nav-link has-children"
                   (click)="toggleExpand(item)"
                   [class.expanded]="item.expanded"
                   [matTooltip]="collapsed ? item.label : ''"
                   matTooltipPosition="right">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                  <mat-icon class="expand-icon" *ngIf="!collapsed">
                    {{ item.expanded ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </a>

                <ul class="sub-nav" *ngIf="item.expanded && !collapsed">
                  <li *ngFor="let child of item.children">
                    <a [routerLink]="child.route"
                       routerLinkActive="active"
                       class="sub-nav-link"
                       *ngIf="hasAccess(child.roles)">
                      <mat-icon>{{ child.icon }}</mat-icon>
                      <span>{{ child.label }}</span>
                    </a>
                  </li>
                </ul>
              </ng-container>
            </li>
          </ng-container>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse.emit()">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 260px;
      background: linear-gradient(180deg, #1a237e 0%, #0d47a1 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 1000;
      overflow-x: hidden;

      &.collapsed {
        width: 64px;

        .sidebar-header {
          padding: 16px 12px;
        }

        .nav-link {
          padding: 12px;
          justify-content: center;
        }
      }
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .logo-text {
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin: 4px 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      &.has-children {
        justify-content: space-between;
      }

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .nav-label {
        flex: 1;
        font-size: 14px;
        white-space: nowrap;
      }

      .expand-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .sub-nav {
      list-style: none;
      padding: 4px 0 4px 32px;
      margin: 0;

      .sub-nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        &.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .collapse-btn {
        width: 100%;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  menuItems: MenuItem[] = [
    {
      icon: 'apartment',
      label: 'Tenant Builder',
      route: '/tenants',
      roles: ['HUB_SUPER_ADMIN', 'HUB_TENANT_MANAGER'],
      expanded: false,
      children: [
        { icon: 'view_list', label: 'Liste des Tenants', route: '/tenants/dashboard' },
        { icon: 'add_circle', label: 'Nouveau Tenant', route: '/tenants/create' },
        { icon: 'compare', label: 'Comparer', route: '/tenants/compare' }
      ]
    },
    {
      icon: 'code',
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
        { icon: 'queue', label: 'File d\'attente', route: '/generator/queue' }
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
        { icon: 'notifications_active', label: 'Alertes', route: '/monitoring/alerts/active' },
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

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.keycloak.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  toggleExpand(item: MenuItem): void {
    if (this.collapsed) {
      this.router.navigate([item.children?.[0]?.route || item.route]);
    } else {
      item.expanded = !item.expanded;
    }
  }
}
