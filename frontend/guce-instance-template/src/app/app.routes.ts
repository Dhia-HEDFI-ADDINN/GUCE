import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Dashboard - accessible to all authenticated users
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

  // ============================================
  // PORTAIL e-FORCE (Operateurs Economiques)
  // ============================================
  {
    path: 'e-force',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['OPERATEUR_ECONOMIQUE', 'DECLARANT', 'COMMISSIONNAIRE_AGREE', 'SUPER_ADMIN_INSTANCE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/e-force/dashboard/eforce-dashboard.component').then(m => m.EforceDashboardComponent)
      },
      // Declarations
      {
        path: 'declarations',
        children: [
          {
            path: 'import',
            loadComponent: () => import('./features/e-force/declarations/declaration-list.component').then(m => m.DeclarationListComponent),
            data: { type: 'import' }
          },
          {
            path: 'export',
            loadComponent: () => import('./features/e-force/declarations/declaration-list.component').then(m => m.DeclarationListComponent),
            data: { type: 'export' }
          },
          {
            path: 'transit',
            loadComponent: () => import('./features/e-force/declarations/declaration-list.component').then(m => m.DeclarationListComponent),
            data: { type: 'transit' }
          },
          {
            path: 'new/:type',
            loadComponent: () => import('./features/e-force/declarations/declaration-form.component').then(m => m.DeclarationFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/e-force/declarations/declaration-detail.component').then(m => m.DeclarationDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/e-force/declarations/declaration-form.component').then(m => m.DeclarationFormComponent)
          }
        ]
      },
      // Procedures
      {
        path: 'procedures',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-force/procedures/procedure-list.component').then(m => m.ProcedureListComponent)
          },
          {
            path: ':procedureCode/new',
            loadComponent: () => import('./features/e-force/procedures/procedure-form.component').then(m => m.ProcedureFormComponent)
          },
          {
            path: ':procedureCode/:id',
            loadComponent: () => import('./features/e-force/procedures/procedure-detail.component').then(m => m.ProcedureDetailComponent)
          }
        ]
      },
      // Documents
      {
        path: 'documents',
        loadComponent: () => import('./features/e-force/documents/document-list.component').then(m => m.DocumentListComponent)
      },
      // Payments
      {
        path: 'payments',
        loadComponent: () => import('./features/e-force/payments/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./features/e-force/notifications/notification-list.component').then(m => m.NotificationListComponent)
      },
      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/e-force/profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      // ============================================
      // FIMEX - Fichier des Importateurs et Exportateurs
      // ============================================
      {
        path: 'fimex',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-force/fimex/fimex-dashboard.component').then(m => m.FimexDashboardComponent)
          },
          {
            path: 'liste',
            loadComponent: () => import('./features/e-force/fimex/fimex-list.component').then(m => m.FimexListComponent)
          },
          {
            path: 'nouvelle-inscription',
            loadComponent: () => import('./features/e-force/fimex/fimex-inscription-form.component').then(m => m.FimexInscriptionFormComponent)
          },
          {
            path: 'inscription/:numeroFIMEX',
            loadComponent: () => import('./features/e-force/fimex/fimex-detail.component').then(m => m.FimexDetailComponent)
          },
          {
            path: 'renouvellement/:numeroFIMEX',
            loadComponent: () => import('./features/e-force/fimex/fimex-inscription-form.component').then(m => m.FimexInscriptionFormComponent),
            data: { mode: 'renewal' }
          },
          {
            path: 'amendement/:numeroFIMEX',
            loadComponent: () => import('./features/e-force/fimex/fimex-inscription-form.component').then(m => m.FimexInscriptionFormComponent),
            data: { mode: 'amendment' }
          }
        ]
      },
      // ============================================
      // Import Declaration (Déclaration d'Importation)
      // ============================================
      {
        path: 'import',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-force/import-declaration/import-dashboard.component').then(m => m.ImportDashboardComponent)
          },
          {
            path: 'liste',
            loadComponent: () => import('./features/e-force/import-declaration/import-list.component').then(m => m.ImportListComponent)
          },
          {
            path: 'nouveau',
            loadComponent: () => import('./features/e-force/import-declaration/import-declaration-form.component').then(m => m.ImportDeclarationFormComponent)
          },
          {
            path: 'dossier/:numeroDossier',
            loadComponent: () => import('./features/e-force/import-declaration/import-detail.component').then(m => m.ImportDetailComponent)
          },
          {
            path: 'dossier/:numeroDossier/edit',
            loadComponent: () => import('./features/e-force/import-declaration/import-declaration-form.component').then(m => m.ImportDeclarationFormComponent),
            data: { mode: 'edit' }
          }
        ]
      }
    ]
  },

  // ============================================
  // PORTAIL e-GOV (Administrations)
  // ============================================
  {
    path: 'e-gov',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['AGENT_ADMINISTRATION', 'AGENT_DOUANE', 'CHEF_BUREAU_DOUANE', 'INSPECTEUR_DOUANE', 'AGENT_PHYTOSANITAIRE', 'AGENT_COMMERCE', 'SUPER_ADMIN_INSTANCE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/e-gov/dashboard/egov-dashboard.component').then(m => m.EgovDashboardComponent)
      },
      // Inbox (Corbeille)
      {
        path: 'inbox',
        loadComponent: () => import('./features/e-gov/inbox/inbox.component').then(m => m.InboxComponent)
      },
      // Processing (Traitement)
      {
        path: 'processing',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-gov/processing/processing-list.component').then(m => m.ProcessingListComponent)
          },
          {
            path: ':dossierId',
            loadComponent: () => import('./features/e-gov/processing/processing-detail.component').then(m => m.ProcessingDetailComponent)
          }
        ]
      },
      // Decisions
      {
        path: 'decisions',
        loadComponent: () => import('./features/e-gov/decisions/decision-list.component').then(m => m.DecisionListComponent)
      },
      // Statistics
      {
        path: 'statistics',
        loadComponent: () => import('./features/e-gov/statistics/statistics.component').then(m => m.StatisticsComponent)
      },
      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./features/e-gov/settings/service-settings.component').then(m => m.ServiceSettingsComponent)
      }
    ]
  },

  // ============================================
  // PORTAIL e-BUSINESS (Intermediaires Agrees)
  // ============================================
  {
    path: 'e-business',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['INTERMEDIAIRE_AGREE', 'AGENT_BANQUE', 'SUPERVISEUR_BANQUE', 'AGENT_SGS', 'AGENT_COMPAGNIE_MARITIME', 'SUPER_ADMIN_INSTANCE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/e-business/dashboard/ebusiness-dashboard.component').then(m => m.EbusinessDashboardComponent)
      },
      // Clients
      {
        path: 'clients',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-business/clients/client-list.component').then(m => m.ClientListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/e-business/clients/client-form.component').then(m => m.ClientFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/e-business/clients/client-detail.component').then(m => m.ClientDetailComponent)
          }
        ]
      },
      // Declarations for clients
      {
        path: 'declarations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-business/declarations/business-declaration-list.component').then(m => m.BusinessDeclarationListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/e-business/declarations/business-declaration-form.component').then(m => m.BusinessDeclarationFormComponent)
          }
        ]
      },
      // Billing
      {
        path: 'billing',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/e-business/billing/billing-list.component').then(m => m.BillingListComponent)
          },
          {
            path: 'invoices',
            loadComponent: () => import('./features/e-business/billing/invoice-list.component').then(m => m.InvoiceListComponent)
          }
        ]
      },
      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./features/e-business/reports/business-reports.component').then(m => m.BusinessReportsComponent)
      }
    ]
  },

  // ============================================
  // MODULE e-PAYMENT
  // ============================================
  {
    path: 'e-payment',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'checkout/:reference',
        loadComponent: () => import('./features/e-payment/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'methods',
        loadComponent: () => import('./features/e-payment/methods/payment-methods.component').then(m => m.PaymentMethodsComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/e-payment/history/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      {
        path: 'receipts/:id',
        loadComponent: () => import('./features/e-payment/receipts/receipt-detail.component').then(m => m.ReceiptDetailComponent)
      },
      {
        path: 'success',
        loadComponent: () => import('./features/e-payment/result/payment-success.component').then(m => m.PaymentSuccessComponent)
      },
      {
        path: 'failure',
        loadComponent: () => import('./features/e-payment/result/payment-failure.component').then(m => m.PaymentFailureComponent)
      }
    ]
  },

  // ============================================
  // PROCEDURE BUILDER (Configuration)
  // ============================================
  {
    path: 'config',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ADMIN_FONCTIONNEL', 'SUPER_ADMIN_INSTANCE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/procedure-builder/dashboard/builder-dashboard.component').then(m => m.BuilderDashboardComponent)
      },
      // Procedures
      {
        path: 'procedures',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./features/procedure-builder/procedures/procedure-config-list.component').then(m => m.ProcedureConfigListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/procedure-builder/procedures/procedure-config-form.component').then(m => m.ProcedureConfigFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/procedure-builder/procedures/procedure-config-form.component').then(m => m.ProcedureConfigFormComponent)
          }
        ]
      },
      // Workflow Designer
      {
        path: 'workflow-designer/:workflowId',
        loadComponent: () => import('./features/procedure-builder/workflow/workflow-designer.component').then(m => m.WorkflowDesignerComponent)
      },
      // Form Builder
      {
        path: 'form-builder/:formId',
        loadComponent: () => import('./features/procedure-builder/forms/form-builder.component').then(m => m.FormBuilderComponent)
      },
      // Data Modeler
      {
        path: 'data-modeler/:entityId',
        loadComponent: () => import('./features/procedure-builder/data/data-modeler.component').then(m => m.DataModelerComponent)
      },
      // Rules Editor
      {
        path: 'rules-editor/:ruleId',
        loadComponent: () => import('./features/procedure-builder/rules/rules-editor.component').then(m => m.RulesEditorComponent)
      },
      // Referentials
      {
        path: 'referentials',
        children: [
          {
            path: 'countries',
            loadComponent: () => import('./features/procedure-builder/referentials/referential-list.component').then(m => m.ReferentialListComponent),
            data: { type: 'countries' }
          },
          {
            path: 'currencies',
            loadComponent: () => import('./features/procedure-builder/referentials/referential-list.component').then(m => m.ReferentialListComponent),
            data: { type: 'currencies' }
          },
          {
            path: 'products',
            loadComponent: () => import('./features/procedure-builder/referentials/referential-list.component').then(m => m.ReferentialListComponent),
            data: { type: 'products' }
          },
          {
            path: 'custom/:refCode',
            loadComponent: () => import('./features/procedure-builder/referentials/referential-list.component').then(m => m.ReferentialListComponent)
          }
        ]
      },
      // Integrations
      {
        path: 'integrations',
        loadComponent: () => import('./features/procedure-builder/integrations/integration-list.component').then(m => m.IntegrationListComponent)
      }
    ]
  },

  // ============================================
  // ADMINISTRATION LOCALE
  // ============================================
  {
    path: 'admin',
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['SUPER_ADMIN_INSTANCE', 'ADMIN_TECHNIQUE', 'USER_MANAGER'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      // Users
      {
        path: 'users',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/users/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'import',
            loadComponent: () => import('./features/admin/users/user-import.component').then(m => m.UserImportComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/admin/users/user-detail.component').then(m => m.UserDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/users/user-form.component').then(m => m.UserFormComponent)
          }
        ]
      },
      // Roles
      {
        path: 'roles',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./features/admin/roles/role-list.component').then(m => m.RoleListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/roles/role-form.component').then(m => m.RoleFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/roles/role-form.component').then(m => m.RoleFormComponent)
          },
          {
            path: ':id/permissions',
            loadComponent: () => import('./features/admin/roles/role-permissions.component').then(m => m.RolePermissionsComponent)
          }
        ]
      },
      // Organizations
      {
        path: 'organizations',
        loadComponent: () => import('./features/admin/organizations/organization-list.component').then(m => m.OrganizationListComponent)
      },
      // Audit
      {
        path: 'audit',
        children: [
          { path: '', redirectTo: 'actions', pathMatch: 'full' },
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
      // Monitoring
      {
        path: 'monitoring',
        children: [
          { path: '', redirectTo: 'health', pathMatch: 'full' },
          {
            path: 'health',
            loadComponent: () => import('./features/admin/monitoring/health-status.component').then(m => m.HealthStatusComponent)
          },
          {
            path: 'metrics',
            loadComponent: () => import('./features/admin/monitoring/metrics-dashboard.component').then(m => m.MetricsDashboardComponent)
          },
          {
            path: 'logs',
            loadComponent: () => import('./features/admin/monitoring/logs-viewer.component').then(m => m.LogsViewerComponent)
          }
        ]
      },
      // Settings
      {
        path: 'settings',
        children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          {
            path: 'general',
            loadComponent: () => import('./features/admin/settings/general-settings.component').then(m => m.GeneralSettingsComponent)
          },
          {
            path: 'branding',
            loadComponent: () => import('./features/admin/settings/branding-settings.component').then(m => m.BrandingSettingsComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/admin/settings/notification-settings.component').then(m => m.NotificationSettingsComponent)
          },
          {
            path: 'integrations',
            loadComponent: () => import('./features/admin/settings/integration-settings.component').then(m => m.IntegrationSettingsComponent)
          }
        ]
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
