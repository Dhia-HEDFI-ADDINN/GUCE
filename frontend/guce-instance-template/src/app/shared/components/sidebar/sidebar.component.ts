import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '@env/environment';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
  badge?: number;
  color?: string;
}

@Component({
  selector: 'guce-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo & Instance Name -->
      <div class="sidebar-header">
        <div class="logo">
          <img [src]="logoUrl" alt="Logo" class="logo-img" *ngIf="!collapsed" />
          <div class="logo-icon" *ngIf="collapsed" [style.background]="primaryColor">
            {{ instanceCode }}
          </div>
        </div>
        <div class="instance-info" *ngIf="!collapsed">
          <span class="instance-name">{{ instanceName }}</span>
          <span class="instance-label">Guichet Unique</span>
        </div>
      </div>

      <!-- User Quick Info -->
      <div class="user-section" *ngIf="!collapsed">
        <div class="user-avatar" [style.background]="primaryColor">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRoleLabel }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link"
               [matTooltip]="collapsed ? 'Tableau de bord' : ''" matTooltipPosition="right">
              <mat-icon>dashboard</mat-icon>
              <span class="nav-label" *ngIf="!collapsed">Tableau de bord</span>
            </a>
          </li>

          <!-- Separator -->
          <li class="nav-separator" *ngIf="!collapsed">
            <span>Portails</span>
          </li>

          <!-- Dynamic Menu Items based on roles -->
          <ng-container *ngFor="let item of menuItems">
            <li class="nav-item" *ngIf="hasAccess(item.roles)">
              <!-- Without children -->
              <a *ngIf="!item.children"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-link"
                 [class.portal-link]="item.color"
                 [style.--portal-color]="item.color"
                 [matTooltip]="collapsed ? item.label : ''"
                 matTooltipPosition="right">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                <span class="nav-badge" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
              </a>

              <!-- With children -->
              <ng-container *ngIf="item.children">
                <a class="nav-link has-children"
                   [class.portal-link]="item.color"
                   [class.expanded]="item.expanded"
                   [style.--portal-color]="item.color"
                   (click)="toggleExpand(item)"
                   [matTooltip]="collapsed ? item.label : ''"
                   matTooltipPosition="right">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                  <mat-icon class="expand-icon" *ngIf="!collapsed">
                    {{ item.expanded ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </a>

                <ul class="sub-nav" *ngIf="item.expanded && !collapsed" [@slideInOut]>
                  <li *ngFor="let child of item.children">
                    <a [routerLink]="child.route"
                       routerLinkActive="active"
                       class="sub-nav-link"
                       *ngIf="hasAccess(child.roles)">
                      <mat-icon>{{ child.icon }}</mat-icon>
                      <span>{{ child.label }}</span>
                      <span class="sub-badge" *ngIf="child.badge">{{ child.badge }}</span>
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
        <div class="version" *ngIf="!collapsed">v{{ version }}</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      background: linear-gradient(180deg, #1a1f36 0%, #252b42 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 1000;
      overflow: hidden;

      &.collapsed {
        width: 72px;

        .sidebar-header {
          padding: 16px 12px;
          justify-content: center;
        }

        .nav-link {
          padding: 14px;
          justify-content: center;
        }
      }
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-img {
      height: 40px;
      width: auto;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .instance-info {
      display: flex;
      flex-direction: column;

      .instance-name {
        font-size: 16px;
        font-weight: 600;
      }

      .instance-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.05);
      margin: 12px;
      border-radius: 8px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      flex-direction: column;

      .user-name {
        font-size: 14px;
        font-weight: 500;
      }

      .user-role {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;

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

    .nav-separator {
      padding: 16px 20px 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
    }

    .nav-item {
      margin: 2px 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;

        &.portal-link {
          background: var(--portal-color, rgba(255, 255, 255, 0.15));
        }
      }

      &.portal-link {
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--portal-color);
          border-radius: 0 2px 2px 0;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover::before, &.active::before {
          opacity: 1;
        }
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
        transition: transform 0.2s;
      }

      .nav-badge {
        background: #f44336;
        color: white;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 600;
      }
    }

    .sub-nav {
      list-style: none;
      padding: 4px 0 4px 44px;
      margin: 0;

      .sub-nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        &.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        .sub-badge {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
        }
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;

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

      .version {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  // Instance configuration
  instanceCode = environment.instance.code;
  instanceName = environment.instance.name;
  primaryColor = environment.branding.primaryColor;
  logoUrl = environment.branding.logo;
  version = '3.0.0';

  // User info
  userName = '';
  userInitials = '';
  userRoleLabel = '';

  // Menu items organized by portal
  menuItems: MenuItem[] = [
    // e-FORCE - Portail Operateurs
    {
      id: 'e-force',
      icon: 'business_center',
      label: 'e-Force',
      route: '/e-force',
      color: '#4caf50',
      roles: ['OPERATEUR_ECONOMIQUE', 'DECLARANT', 'COMMISSIONNAIRE_AGREE', 'SUPER_ADMIN_INSTANCE'],
      expanded: false,
      children: [
        { id: 'eforce-dashboard', icon: 'dashboard', label: 'Tableau de bord', route: '/e-force/dashboard' },
        { id: 'eforce-import', icon: 'input', label: 'Import', route: '/e-force/declarations/import', badge: 3 },
        { id: 'eforce-export', icon: 'output', label: 'Export', route: '/e-force/declarations/export' },
        { id: 'eforce-transit', icon: 'local_shipping', label: 'Transit', route: '/e-force/declarations/transit' },
        { id: 'eforce-procedures', icon: 'assignment', label: 'Procedures', route: '/e-force/procedures' },
        { id: 'eforce-documents', icon: 'folder', label: 'Documents', route: '/e-force/documents' },
        { id: 'eforce-payments', icon: 'payment', label: 'Paiements', route: '/e-force/payments' }
      ]
    },

    // e-GOV - Portail Administrations
    {
      id: 'e-gov',
      icon: 'account_balance',
      label: 'e-Gov',
      route: '/e-gov',
      color: '#2196f3',
      roles: ['AGENT_ADMINISTRATION', 'AGENT_DOUANE', 'CHEF_BUREAU_DOUANE', 'INSPECTEUR_DOUANE', 'AGENT_PHYTOSANITAIRE', 'AGENT_COMMERCE', 'SUPER_ADMIN_INSTANCE'],
      expanded: false,
      children: [
        { id: 'egov-dashboard', icon: 'dashboard', label: 'Tableau de bord', route: '/e-gov/dashboard' },
        { id: 'egov-inbox', icon: 'inbox', label: 'Corbeille', route: '/e-gov/inbox', badge: 12 },
        { id: 'egov-processing', icon: 'pending_actions', label: 'En traitement', route: '/e-gov/processing' },
        { id: 'egov-decisions', icon: 'gavel', label: 'Decisions', route: '/e-gov/decisions' },
        { id: 'egov-statistics', icon: 'bar_chart', label: 'Statistiques', route: '/e-gov/statistics' }
      ]
    },

    // e-BUSINESS - Portail Intermediaires
    {
      id: 'e-business',
      icon: 'storefront',
      label: 'e-Business',
      route: '/e-business',
      color: '#ff9800',
      roles: ['INTERMEDIAIRE_AGREE', 'AGENT_BANQUE', 'SUPERVISEUR_BANQUE', 'AGENT_SGS', 'AGENT_COMPAGNIE_MARITIME', 'SUPER_ADMIN_INSTANCE'],
      expanded: false,
      children: [
        { id: 'ebiz-dashboard', icon: 'dashboard', label: 'Tableau de bord', route: '/e-business/dashboard' },
        { id: 'ebiz-clients', icon: 'people', label: 'Clients', route: '/e-business/clients' },
        { id: 'ebiz-declarations', icon: 'description', label: 'Declarations', route: '/e-business/declarations' },
        { id: 'ebiz-billing', icon: 'receipt', label: 'Facturation', route: '/e-business/billing' },
        { id: 'ebiz-reports', icon: 'assessment', label: 'Rapports', route: '/e-business/reports' }
      ]
    },

    // e-PAYMENT
    {
      id: 'e-payment',
      icon: 'payment',
      label: 'e-Payment',
      route: '/e-payment/history',
      color: '#9c27b0',
      roles: ['OPERATEUR_ECONOMIQUE', 'INTERMEDIAIRE_AGREE', 'SUPER_ADMIN_INSTANCE']
    },

    // PROCEDURE BUILDER
    {
      id: 'procedure-builder',
      icon: 'build',
      label: 'Procedure Builder',
      route: '/config',
      color: '#00bcd4',
      roles: ['ADMIN_FONCTIONNEL', 'SUPER_ADMIN_INSTANCE'],
      expanded: false,
      children: [
        { id: 'config-dashboard', icon: 'dashboard', label: 'Vue d\'ensemble', route: '/config/dashboard' },
        { id: 'config-procedures', icon: 'account_tree', label: 'Procedures', route: '/config/procedures/list' },
        { id: 'config-referentials', icon: 'list_alt', label: 'Referentiels', route: '/config/referentials/countries' },
        { id: 'config-integrations', icon: 'sync_alt', label: 'Integrations', route: '/config/integrations' }
      ]
    },

    // ADMIN LOCAL
    {
      id: 'admin',
      icon: 'admin_panel_settings',
      label: 'Administration',
      route: '/admin',
      color: '#f44336',
      roles: ['SUPER_ADMIN_INSTANCE', 'ADMIN_TECHNIQUE', 'USER_MANAGER'],
      expanded: false,
      children: [
        { id: 'admin-dashboard', icon: 'dashboard', label: 'Vue d\'ensemble', route: '/admin/dashboard' },
        { id: 'admin-users', icon: 'people', label: 'Utilisateurs', route: '/admin/users/list' },
        { id: 'admin-roles', icon: 'security', label: 'Roles', route: '/admin/roles/list' },
        { id: 'admin-orgs', icon: 'business', label: 'Organisations', route: '/admin/organizations/administrations' },
        { id: 'admin-audit', icon: 'history', label: 'Audit', route: '/admin/audit/actions' },
        { id: 'admin-monitoring', icon: 'monitor_heart', label: 'Monitoring', route: '/admin/monitoring/health' },
        { id: 'admin-settings', icon: 'settings', label: 'Parametres', route: '/admin/settings/general' }
      ]
    }
  ];

  async ngOnInit() {
    await this.loadUserInfo();
    this.expandActiveMenu();
  }

  async loadUserInfo() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName} ${profile.lastName}`;
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

      const roles = this.keycloak.getUserRoles();
      this.userRoleLabel = this.getRoleLabel(roles);
    } catch {
      this.userName = 'Utilisateur';
      this.userInitials = 'U';
      this.userRoleLabel = 'Utilisateur';
    }
  }

  getRoleLabel(roles: string[]): string {
    if (roles.includes('SUPER_ADMIN_INSTANCE')) return 'Super Admin';
    if (roles.includes('ADMIN_FONCTIONNEL')) return 'Admin Fonctionnel';
    if (roles.includes('ADMIN_TECHNIQUE')) return 'Admin Technique';
    if (roles.includes('OPERATEUR_ECONOMIQUE')) return 'Operateur';
    if (roles.includes('DECLARANT')) return 'Declarant';
    if (roles.includes('AGENT_DOUANE')) return 'Agent Douanes';
    if (roles.includes('AGENT_ADMINISTRATION')) return 'Agent Admin';
    if (roles.includes('INTERMEDIAIRE_AGREE')) return 'Intermediaire';
    if (roles.includes('AGENT_BANQUE')) return 'Agent Banque';
    return 'Utilisateur';
  }

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.keycloak.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  toggleExpand(item: MenuItem): void {
    if (this.collapsed) {
      this.router.navigate([item.children?.[0]?.route || item.route]);
    } else {
      // Close other items
      this.menuItems.forEach(m => {
        if (m.id !== item.id) m.expanded = false;
      });
      item.expanded = !item.expanded;
    }
  }

  expandActiveMenu(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          currentUrl.startsWith(child.route)
        );
        if (hasActiveChild) {
          item.expanded = true;
        }
      }
    });
  }
}
