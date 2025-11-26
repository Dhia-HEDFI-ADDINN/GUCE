import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';

/**
 * Tools Routes for E-GUCE Hub
 * Unified access to all integrated tools
 */
export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/tools-dashboard/tools-dashboard.component').then(m => m.ToolsDashboardComponent),
        title: 'Centre de contrôle'
      },
      {
        path: 'grafana',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'grafana',
          roles: ['hub-admin', 'hub-operator', 'monitoring-viewer'],
          title: 'Grafana - Monitoring'
        }
      },
      {
        path: 'kibana',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'kibana',
          roles: ['hub-admin', 'log-viewer'],
          title: 'Kibana - Logs'
        }
      },
      {
        path: 'keycloak-admin',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'keycloak-admin',
          roles: ['hub-admin'],
          title: 'Keycloak Admin'
        }
      },
      {
        path: 'camunda',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'camunda',
          roles: ['hub-admin', 'workflow-admin'],
          title: 'Camunda - Workflow'
        }
      },
      {
        path: 'camunda/:subTool',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'camunda',
          roles: ['hub-admin', 'workflow-admin'],
          title: 'Camunda'
        }
      },
      {
        path: 'drools',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'drools',
          roles: ['hub-admin', 'rules-admin'],
          title: 'Drools - Règles'
        }
      },
      {
        path: 'prometheus',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'prometheus',
          roles: ['hub-admin', 'monitoring-viewer'],
          title: 'Prometheus - Métriques'
        }
      },
      {
        path: 'jaeger',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'jaeger',
          roles: ['hub-admin', 'developer'],
          title: 'Jaeger - Traçage'
        }
      },
      {
        path: 'api-docs',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [PermissionGuard],
        data: {
          toolId: 'swagger',
          roles: ['hub-admin', 'developer'],
          title: 'API Documentation'
        }
      },
      {
        path: ':toolId',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        title: 'Outil'
      },
      {
        path: ':toolId/:subPath',
        loadComponent: () =>
          import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        title: 'Outil'
      }
    ]
  }
];
