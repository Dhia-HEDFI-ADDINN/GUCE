import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  // Main authenticated layout
  {
    path: '',
    loadComponent: () => import('./shared/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { title: 'Dashboard', breadcrumbs: [{ label: 'Dashboard' }] }
      },

      // ========== TENANT BUILDER ==========
      {
        path: 'tenants',
        canActivate: [roleGuard],
        data: { roles: ['HUB_SUPER_ADMIN', 'HUB_TENANT_MANAGER'] },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/tenants/tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent),
            data: { title: 'Tenants', breadcrumbs: [{ label: 'Tenant Builder' }, { label: 'Dashboard' }] }
          },
          {
            path: 'create',
            loadComponent: () => import('./features/tenants/tenant-wizard/tenant-wizard.component').then(m => m.TenantWizardComponent),
            data: { title: 'Nouveau Tenant', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Nouveau' }] }
          },
          {
            path: 'compare',
            loadComponent: () => import('./features/tenants/tenant-compare/tenant-compare.component').then(m => m.TenantCompareComponent),
            data: { title: 'Comparer Tenants', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Comparer' }] }
          },
          {
            path: ':tenantId',
            children: [
              {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
              },
              {
                path: 'overview',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-overview.component').then(m => m.TenantOverviewComponent),
                data: { title: 'Tenant', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Details' }] }
              },
              {
                path: 'modules',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-modules.component').then(m => m.TenantModulesComponent),
                data: { title: 'Modules', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Modules' }] }
              },
              {
                path: 'config',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-config.component').then(m => m.TenantConfigComponent),
                data: { title: 'Configuration', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Configuration' }] }
              },
              {
                path: 'users',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-users.component').then(m => m.TenantUsersComponent),
                data: { title: 'Utilisateurs', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Utilisateurs' }] }
              },
              {
                path: 'resources',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-resources.component').then(m => m.TenantResourcesComponent),
                data: { title: 'Ressources', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Ressources' }] }
              },
              {
                path: 'logs',
                loadComponent: () => import('./features/tenants/tenant-detail/tenant-logs.component').then(m => m.TenantLogsComponent),
                data: { title: 'Logs', breadcrumbs: [{ label: 'Tenant Builder', route: '/tenants' }, { label: 'Logs' }] }
              }
            ]
          }
        ]
      },

      // ========== GENERATOR ENGINE ==========
      {
        path: 'generator',
        canActivate: [roleGuard],
        data: { roles: ['HUB_SUPER_ADMIN', 'HUB_GENERATOR_OPERATOR'] },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/generator/generator-dashboard/generator-dashboard.component').then(m => m.GeneratorDashboardComponent),
            data: { title: 'Generator Engine', breadcrumbs: [{ label: 'Generator Engine' }, { label: 'Dashboard' }] }
          },
          {
            path: 'procedures',
            loadComponent: () => import('./features/generator/generate-procedure/generate-procedure.component').then(m => m.GenerateProcedureComponent),
            data: { title: 'Procedures', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'Procedures' }] }
          },
          {
            path: 'entities',
            loadComponent: () => import('./features/generator/generate-entity/generate-entity.component').then(m => m.GenerateEntityComponent),
            data: { title: 'Entites', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'Entites' }] }
          },
          {
            path: 'frontends',
            loadComponent: () => import('./features/generator/generate-frontend/generate-frontend.component').then(m => m.GenerateFrontendComponent),
            data: { title: 'Frontends', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'Frontends' }] }
          },
          {
            path: 'infrastructure',
            loadComponent: () => import('./features/generator/generate-infra/generate-infra.component').then(m => m.GenerateInfraComponent),
            data: { title: 'Infrastructure', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'Infrastructure' }] }
          },
          {
            path: 'history',
            loadComponent: () => import('./features/generator/generation-history/generation-history.component').then(m => m.GenerationHistoryComponent),
            data: { title: 'Historique', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'Historique' }] }
          },
          {
            path: 'queue',
            loadComponent: () => import('./features/generator/generation-queue/generation-queue.component').then(m => m.GenerationQueueComponent),
            data: { title: 'File d\'attente', breadcrumbs: [{ label: 'Generator Engine', route: '/generator' }, { label: 'File d\'attente' }] }
          }
        ]
      },

      // ========== MONITORING 360 ==========
      {
        path: 'monitoring',
        canActivate: [roleGuard],
        data: { roles: ['HUB_SUPER_ADMIN', 'HUB_MONITORING_VIEWER'] },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/monitoring/monitoring-dashboard/monitoring-dashboard.component').then(m => m.MonitoringDashboardComponent),
            data: { title: 'Monitoring', breadcrumbs: [{ label: 'Monitoring 360' }, { label: 'Dashboard' }] }
          },
          // Health
          {
            path: 'health',
            children: [
              {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
              },
              {
                path: 'overview',
                loadComponent: () => import('./features/monitoring/health/health-overview.component').then(m => m.HealthOverviewComponent),
                data: { title: 'Sante', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Sante' }] }
              },
              {
                path: ':serviceId',
                loadComponent: () => import('./features/monitoring/health/health-detail.component').then(m => m.HealthDetailComponent),
                data: { title: 'Detail Service', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Sante' }] }
              }
            ]
          },
          // Resources
          {
            path: 'resources',
            children: [
              {
                path: '',
                redirectTo: 'cpu',
                pathMatch: 'full'
              },
              {
                path: 'cpu',
                loadComponent: () => import('./features/monitoring/resources/resource-cpu.component').then(m => m.ResourceCpuComponent),
                data: { title: 'CPU', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'CPU' }] }
              },
              {
                path: 'memory',
                loadComponent: () => import('./features/monitoring/resources/resource-memory.component').then(m => m.ResourceMemoryComponent),
                data: { title: 'Memoire', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Memoire' }] }
              },
              {
                path: 'storage',
                loadComponent: () => import('./features/monitoring/resources/resource-storage.component').then(m => m.ResourceStorageComponent),
                data: { title: 'Stockage', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Stockage' }] }
              },
              {
                path: 'network',
                loadComponent: () => import('./features/monitoring/resources/resource-network.component').then(m => m.ResourceNetworkComponent),
                data: { title: 'Reseau', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Reseau' }] }
              },
              {
                path: 'by-tenant',
                loadComponent: () => import('./features/monitoring/resources/resources-by-tenant.component').then(m => m.ResourcesByTenantComponent),
                data: { title: 'Par Tenant', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Par Tenant' }] }
              }
            ]
          },
          // Alerts
          {
            path: 'alerts',
            children: [
              {
                path: '',
                redirectTo: 'active',
                pathMatch: 'full'
              },
              {
                path: 'active',
                loadComponent: () => import('./features/monitoring/alerts/alerts-active.component').then(m => m.AlertsActiveComponent),
                data: { title: 'Alertes Actives', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Alertes' }] }
              },
              {
                path: 'history',
                loadComponent: () => import('./features/monitoring/alerts/alerts-history.component').then(m => m.AlertsHistoryComponent),
                data: { title: 'Historique Alertes', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Historique' }] }
              },
              {
                path: 'rules',
                loadComponent: () => import('./features/monitoring/alerts/alerts-rules.component').then(m => m.AlertsRulesComponent),
                data: { title: 'Regles Alertes', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Regles' }] }
              }
            ]
          },
          // Metrics
          {
            path: 'metrics',
            children: [
              {
                path: 'performance',
                loadComponent: () => import('./features/monitoring/metrics/metrics-performance.component').then(m => m.MetricsPerformanceComponent),
                data: { title: 'Performance', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Performance' }] }
              },
              {
                path: 'transactions',
                loadComponent: () => import('./features/monitoring/metrics/metrics-transactions.component').then(m => m.MetricsTransactionsComponent),
                data: { title: 'Transactions', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Transactions' }] }
              },
              {
                path: 'users',
                loadComponent: () => import('./features/monitoring/metrics/metrics-users.component').then(m => m.MetricsUsersComponent),
                data: { title: 'Utilisateurs', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Utilisateurs' }] }
              }
            ]
          },
          // Reports
          {
            path: 'reports',
            children: [
              {
                path: '',
                redirectTo: 'daily',
                pathMatch: 'full'
              },
              {
                path: 'daily',
                loadComponent: () => import('./features/monitoring/reports/report-daily.component').then(m => m.ReportDailyComponent),
                data: { title: 'Rapport Journalier', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Journalier' }] }
              },
              {
                path: 'weekly',
                loadComponent: () => import('./features/monitoring/reports/report-weekly.component').then(m => m.ReportWeeklyComponent),
                data: { title: 'Rapport Hebdomadaire', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Hebdomadaire' }] }
              },
              {
                path: 'custom',
                loadComponent: () => import('./features/monitoring/reports/report-custom.component').then(m => m.ReportCustomComponent),
                data: { title: 'Rapport Personnalise', breadcrumbs: [{ label: 'Monitoring 360', route: '/monitoring' }, { label: 'Personnalise' }] }
              }
            ]
          }
        ]
      },

      // ========== ADMIN CENTRAL ==========
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['HUB_SUPER_ADMIN'] },
        children: [
          {
            path: '',
            redirectTo: 'users/list',
            pathMatch: 'full'
          },
          // Users
          {
            path: 'users',
            children: [
              {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
              },
              {
                path: 'list',
                loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent),
                data: { title: 'Utilisateurs', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Utilisateurs' }] }
              },
              {
                path: 'create',
                loadComponent: () => import('./features/admin/users/user-create.component').then(m => m.UserCreateComponent),
                data: { title: 'Nouvel Utilisateur', breadcrumbs: [{ label: 'Admin Central', route: '/admin/users' }, { label: 'Nouveau' }] }
              },
              {
                path: ':userId/edit',
                loadComponent: () => import('./features/admin/users/user-edit.component').then(m => m.UserEditComponent),
                data: { title: 'Modifier Utilisateur', breadcrumbs: [{ label: 'Admin Central', route: '/admin/users' }, { label: 'Modifier' }] }
              },
              {
                path: ':userId/permissions',
                loadComponent: () => import('./features/admin/users/user-permissions.component').then(m => m.UserPermissionsComponent),
                data: { title: 'Permissions Utilisateur', breadcrumbs: [{ label: 'Admin Central', route: '/admin/users' }, { label: 'Permissions' }] }
              }
            ]
          },
          // Roles
          {
            path: 'roles',
            children: [
              {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
              },
              {
                path: 'list',
                loadComponent: () => import('./features/admin/roles/role-list.component').then(m => m.RoleListComponent),
                data: { title: 'Roles', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Roles' }] }
              },
              {
                path: 'create',
                loadComponent: () => import('./features/admin/roles/role-create.component').then(m => m.RoleCreateComponent),
                data: { title: 'Nouveau Role', breadcrumbs: [{ label: 'Admin Central', route: '/admin/roles' }, { label: 'Nouveau' }] }
              },
              {
                path: ':roleId/permissions',
                loadComponent: () => import('./features/admin/roles/role-permissions.component').then(m => m.RolePermissionsComponent),
                data: { title: 'Permissions Role', breadcrumbs: [{ label: 'Admin Central', route: '/admin/roles' }, { label: 'Permissions' }] }
              }
            ]
          },
          // Organizations
          {
            path: 'organizations',
            loadComponent: () => import('./features/admin/organizations/organization-list.component').then(m => m.OrganizationListComponent),
            data: { title: 'Organisations', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Organisations' }] }
          },
          // Audit
          {
            path: 'audit',
            children: [
              {
                path: '',
                redirectTo: 'actions',
                pathMatch: 'full'
              },
              {
                path: 'actions',
                loadComponent: () => import('./features/admin/audit/audit-actions.component').then(m => m.AuditActionsComponent),
                data: { title: 'Audit Actions', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Audit' }] }
              },
              {
                path: 'logins',
                loadComponent: () => import('./features/admin/audit/audit-logins.component').then(m => m.AuditLoginsComponent),
                data: { title: 'Audit Connexions', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Connexions' }] }
              },
              {
                path: 'changes',
                loadComponent: () => import('./features/admin/audit/audit-changes.component').then(m => m.AuditChangesComponent),
                data: { title: 'Audit Changements', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Changements' }] }
              }
            ]
          },
          // Billing
          {
            path: 'billing',
            children: [
              {
                path: '',
                redirectTo: 'subscriptions',
                pathMatch: 'full'
              },
              {
                path: 'subscriptions',
                loadComponent: () => import('./features/admin/billing/billing-subscriptions.component').then(m => m.BillingSubscriptionsComponent),
                data: { title: 'Abonnements', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Abonnements' }] }
              },
              {
                path: 'usage',
                loadComponent: () => import('./features/admin/billing/billing-usage.component').then(m => m.BillingUsageComponent),
                data: { title: 'Consommation', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Consommation' }] }
              },
              {
                path: 'invoices',
                loadComponent: () => import('./features/admin/billing/billing-invoices.component').then(m => m.BillingInvoicesComponent),
                data: { title: 'Factures', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Factures' }] }
              }
            ]
          },
          // Settings
          {
            path: 'settings',
            children: [
              {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
              },
              {
                path: 'general',
                loadComponent: () => import('./features/admin/settings/settings-general.component').then(m => m.SettingsGeneralComponent),
                data: { title: 'Parametres Generaux', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Parametres' }] }
              },
              {
                path: 'security',
                loadComponent: () => import('./features/admin/settings/settings-security.component').then(m => m.SettingsSecurityComponent),
                data: { title: 'Securite', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Securite' }] }
              },
              {
                path: 'notifications',
                loadComponent: () => import('./features/admin/settings/settings-notifications.component').then(m => m.SettingsNotificationsComponent),
                data: { title: 'Notifications', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Notifications' }] }
              },
              {
                path: 'integrations',
                loadComponent: () => import('./features/admin/settings/settings-integrations.component').then(m => m.SettingsIntegrationsComponent),
                data: { title: 'Integrations', breadcrumbs: [{ label: 'Admin Central' }, { label: 'Integrations' }] }
              }
            ]
          }
        ]
      },

      // ========== TEMPLATES LIBRARY ==========
      {
        path: 'templates',
        canActivate: [roleGuard],
        data: { roles: ['HUB_SUPER_ADMIN', 'HUB_TEMPLATE_MANAGER'] },
        children: [
          {
            path: '',
            redirectTo: 'procedures/import',
            pathMatch: 'full'
          },
          // Procedures
          {
            path: 'procedures',
            children: [
              {
                path: '',
                redirectTo: 'import',
                pathMatch: 'full'
              },
              {
                path: 'import',
                loadComponent: () => import('./features/templates/procedures/template-import.component').then(m => m.TemplateImportComponent),
                data: { title: 'Templates Import', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Import' }] }
              },
              {
                path: 'export',
                loadComponent: () => import('./features/templates/procedures/template-export.component').then(m => m.TemplateExportComponent),
                data: { title: 'Templates Export', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Export' }] }
              },
              {
                path: 'transit',
                loadComponent: () => import('./features/templates/procedures/template-transit.component').then(m => m.TemplateTransitComponent),
                data: { title: 'Templates Transit', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Transit' }] }
              },
              {
                path: 'custom',
                loadComponent: () => import('./features/templates/procedures/template-custom.component').then(m => m.TemplateCustomComponent),
                data: { title: 'Templates Personnalises', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Personnalises' }] }
              }
            ]
          },
          // Workflows
          {
            path: 'workflows',
            loadComponent: () => import('./features/templates/workflows/template-workflows.component').then(m => m.TemplateWorkflowsComponent),
            data: { title: 'Templates Workflows', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Workflows' }] }
          },
          // Forms
          {
            path: 'forms',
            loadComponent: () => import('./features/templates/forms/template-forms.component').then(m => m.TemplateFormsComponent),
            data: { title: 'Templates Formulaires', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Formulaires' }] }
          },
          // Rules
          {
            path: 'rules',
            loadComponent: () => import('./features/templates/rules/template-rules.component').then(m => m.TemplateRulesComponent),
            data: { title: 'Templates Regles', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Regles' }] }
          },
          // Reports
          {
            path: 'reports',
            loadComponent: () => import('./features/templates/reports/template-reports.component').then(m => m.TemplateReportsComponent),
            data: { title: 'Templates Rapports', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Rapports' }] }
          },
          // Marketplace
          {
            path: 'marketplace',
            loadComponent: () => import('./features/templates/marketplace/template-marketplace.component').then(m => m.TemplateMarketplaceComponent),
            data: { title: 'Marketplace', breadcrumbs: [{ label: 'Templates Library' }, { label: 'Marketplace' }] }
          }
        ]
      },

      // ========== TOOLS ==========
      {
        path: 'tools',
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/tools/components/tools-dashboard/tools-dashboard.component').then(m => m.ToolsDashboardComponent),
            data: { title: 'Outils', breadcrumbs: [{ label: 'Outils' }] }
          },
          {
            path: ':toolId',
            loadComponent: () => import('./features/tools/components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
            data: { title: 'Outil', breadcrumbs: [{ label: 'Outils', route: '/tools' }, { label: 'Detail' }] }
          }
        ]
      },

      // ========== PROFILE ==========
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'Mon Profil', breadcrumbs: [{ label: 'Profil' }] }
      },

      // ========== NOTIFICATIONS ==========
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        data: { title: 'Notifications', breadcrumbs: [{ label: 'Notifications' }] }
      }
    ]
  },

  // Wildcard - redirect to dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
