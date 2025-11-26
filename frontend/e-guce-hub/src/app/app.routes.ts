import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  // MODULE 1: TENANT BUILDER
  {
    path: 'tenants',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['HUB_SUPER_ADMIN', 'HUB_TENANT_MANAGER'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/tenants/tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/tenants/tenant-wizard/tenant-wizard.component').then(m => m.TenantWizardComponent)
      },
      {
        path: ':tenantId',
        children: [
          {
            path: 'overview',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-overview.component').then(m => m.TenantOverviewComponent)
          },
          {
            path: 'config',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-config.component').then(m => m.TenantConfigComponent)
          },
          {
            path: 'modules',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-modules.component').then(m => m.TenantModulesComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-users.component').then(m => m.TenantUsersComponent)
          },
          {
            path: 'resources',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-resources.component').then(m => m.TenantResourcesComponent)
          },
          {
            path: 'logs',
            loadComponent: () => import('./features/tenants/tenant-detail/tenant-logs.component').then(m => m.TenantLogsComponent)
          }
        ]
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/tenants/tenant-compare/tenant-compare.component').then(m => m.TenantCompareComponent)
      }
    ]
  },
  // MODULE 2: GENERATOR ENGINE
  {
    path: 'generator',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['HUB_SUPER_ADMIN', 'HUB_GENERATOR_OPERATOR'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/generator/generator-dashboard/generator-dashboard.component').then(m => m.GeneratorDashboardComponent)
      },
      {
        path: 'procedures',
        loadComponent: () => import('./features/generator/generate-procedure/generate-procedure.component').then(m => m.GenerateProcedureComponent)
      },
      {
        path: 'entities',
        loadComponent: () => import('./features/generator/generate-entity/generate-entity.component').then(m => m.GenerateEntityComponent)
      },
      {
        path: 'frontends',
        loadComponent: () => import('./features/generator/generate-frontend/generate-frontend.component').then(m => m.GenerateFrontendComponent)
      },
      {
        path: 'infrastructure',
        loadComponent: () => import('./features/generator/generate-infra/generate-infra.component').then(m => m.GenerateInfraComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/generator/generation-history/generation-history.component').then(m => m.GenerationHistoryComponent)
      },
      {
        path: 'queue',
        loadComponent: () => import('./features/generator/generation-queue/generation-queue.component').then(m => m.GenerationQueueComponent)
      }
    ]
  },
  // MODULE 3: MONITORING 360
  {
    path: 'monitoring',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['HUB_SUPER_ADMIN', 'HUB_MONITORING_VIEWER'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/monitoring/monitoring-dashboard/monitoring-dashboard.component').then(m => m.MonitoringDashboardComponent)
      },
      {
        path: 'health',
        children: [
          {
            path: 'overview',
            loadComponent: () => import('./features/monitoring/health/health-overview.component').then(m => m.HealthOverviewComponent)
          },
          {
            path: ':tenantId',
            loadComponent: () => import('./features/monitoring/health/health-detail.component').then(m => m.HealthDetailComponent)
          }
        ]
      },
      {
        path: 'resources',
        children: [
          {
            path: 'cpu',
            loadComponent: () => import('./features/monitoring/resources/resource-cpu.component').then(m => m.ResourceCpuComponent)
          },
          {
            path: 'memory',
            loadComponent: () => import('./features/monitoring/resources/resource-memory.component').then(m => m.ResourceMemoryComponent)
          },
          {
            path: 'storage',
            loadComponent: () => import('./features/monitoring/resources/resource-storage.component').then(m => m.ResourceStorageComponent)
          },
          {
            path: 'network',
            loadComponent: () => import('./features/monitoring/resources/resource-network.component').then(m => m.ResourceNetworkComponent)
          },
          {
            path: 'by-tenant',
            loadComponent: () => import('./features/monitoring/resources/resources-by-tenant.component').then(m => m.ResourcesByTenantComponent)
          }
        ]
      },
      {
        path: 'metrics',
        children: [
          {
            path: 'transactions',
            loadComponent: () => import('./features/monitoring/metrics/metrics-transactions.component').then(m => m.MetricsTransactionsComponent)
          },
          {
            path: 'users-active',
            loadComponent: () => import('./features/monitoring/metrics/metrics-users.component').then(m => m.MetricsUsersComponent)
          },
          {
            path: 'performance',
            loadComponent: () => import('./features/monitoring/metrics/metrics-performance.component').then(m => m.MetricsPerformanceComponent)
          }
        ]
      },
      {
        path: 'alerts',
        children: [
          {
            path: 'active',
            loadComponent: () => import('./features/monitoring/alerts/alerts-active.component').then(m => m.AlertsActiveComponent)
          },
          {
            path: 'history',
            loadComponent: () => import('./features/monitoring/alerts/alerts-history.component').then(m => m.AlertsHistoryComponent)
          },
          {
            path: 'rules',
            loadComponent: () => import('./features/monitoring/alerts/alerts-rules.component').then(m => m.AlertsRulesComponent)
          }
        ]
      },
      {
        path: 'reports',
        children: [
          {
            path: 'daily',
            loadComponent: () => import('./features/monitoring/reports/report-daily.component').then(m => m.ReportDailyComponent)
          },
          {
            path: 'weekly',
            loadComponent: () => import('./features/monitoring/reports/report-weekly.component').then(m => m.ReportWeeklyComponent)
          },
          {
            path: 'custom',
            loadComponent: () => import('./features/monitoring/reports/report-custom.component').then(m => m.ReportCustomComponent)
          }
        ]
      }
    ]
  },
  // MODULE 4: ADMINISTRATION CENTRALE
  {
    path: 'admin',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['HUB_SUPER_ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'users/list',
        pathMatch: 'full'
      },
      {
        path: 'users',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/admin/users/user-create.component').then(m => m.UserCreateComponent)
          },
          {
            path: ':userId/edit',
            loadComponent: () => import('./features/admin/users/user-edit.component').then(m => m.UserEditComponent)
          },
          {
            path: ':userId/permissions',
            loadComponent: () => import('./features/admin/users/user-permissions.component').then(m => m.UserPermissionsComponent)
          }
        ]
      },
      {
        path: 'roles',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./features/admin/roles/role-list.component').then(m => m.RoleListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/admin/roles/role-create.component').then(m => m.RoleCreateComponent)
          },
          {
            path: ':roleId/permissions',
            loadComponent: () => import('./features/admin/roles/role-permissions.component').then(m => m.RolePermissionsComponent)
          }
        ]
      },
      {
        path: 'organizations',
        loadComponent: () => import('./features/admin/organizations/organization-list.component').then(m => m.OrganizationListComponent)
      },
      {
        path: 'audit',
        children: [
          {
            path: 'actions',
            loadComponent: () => import('./features/admin/audit/audit-actions.component').then(m => m.AuditActionsComponent)
          },
          {
            path: 'logins',
            loadComponent: () => import('./features/admin/audit/audit-logins.component').then(m => m.AuditLoginsComponent)
          },
          {
            path: 'changes',
            loadComponent: () => import('./features/admin/audit/audit-changes.component').then(m => m.AuditChangesComponent)
          }
        ]
      },
      {
        path: 'billing',
        children: [
          {
            path: 'subscriptions',
            loadComponent: () => import('./features/admin/billing/billing-subscriptions.component').then(m => m.BillingSubscriptionsComponent)
          },
          {
            path: 'invoices',
            loadComponent: () => import('./features/admin/billing/billing-invoices.component').then(m => m.BillingInvoicesComponent)
          },
          {
            path: 'usage',
            loadComponent: () => import('./features/admin/billing/billing-usage.component').then(m => m.BillingUsageComponent)
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: 'general',
            loadComponent: () => import('./features/admin/settings/settings-general.component').then(m => m.SettingsGeneralComponent)
          },
          {
            path: 'security',
            loadComponent: () => import('./features/admin/settings/settings-security.component').then(m => m.SettingsSecurityComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/admin/settings/settings-notifications.component').then(m => m.SettingsNotificationsComponent)
          },
          {
            path: 'integrations',
            loadComponent: () => import('./features/admin/settings/settings-integrations.component').then(m => m.SettingsIntegrationsComponent)
          }
        ]
      }
    ]
  },
  // MODULE 5: TEMPLATES LIBRARY
  {
    path: 'templates',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['HUB_SUPER_ADMIN', 'HUB_TEMPLATE_MANAGER'] },
    children: [
      {
        path: '',
        redirectTo: 'procedures/import',
        pathMatch: 'full'
      },
      {
        path: 'procedures',
        children: [
          {
            path: 'import',
            loadComponent: () => import('./features/templates/procedures/template-import.component').then(m => m.TemplateImportComponent)
          },
          {
            path: 'export',
            loadComponent: () => import('./features/templates/procedures/template-export.component').then(m => m.TemplateExportComponent)
          },
          {
            path: 'transit',
            loadComponent: () => import('./features/templates/procedures/template-transit.component').then(m => m.TemplateTransitComponent)
          },
          {
            path: 'custom',
            loadComponent: () => import('./features/templates/procedures/template-custom.component').then(m => m.TemplateCustomComponent)
          }
        ]
      },
      {
        path: 'workflows',
        loadComponent: () => import('./features/templates/workflows/template-workflows.component').then(m => m.TemplateWorkflowsComponent)
      },
      {
        path: 'forms',
        loadComponent: () => import('./features/templates/forms/template-forms.component').then(m => m.TemplateFormsComponent)
      },
      {
        path: 'rules',
        loadComponent: () => import('./features/templates/rules/template-rules.component').then(m => m.TemplateRulesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/templates/reports/template-reports.component').then(m => m.TemplateReportsComponent)
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./features/templates/marketplace/template-marketplace.component').then(m => m.TemplateMarketplaceComponent)
      }
    ]
  },
  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
