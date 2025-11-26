import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard, AdminGuard } from '../../core/guards/permission.guard';

/**
 * Tools Routes for GUCE Instance
 * Unified access to all integrated tools (Camunda, Drools, Grafana, etc.)
 */
export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      // Camunda Workflow Tools
      {
        path: 'camunda/cockpit',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        data: { toolId: 'camunda-cockpit', roles: ['instance-admin', 'supervisor'] },
        title: 'Camunda Cockpit'
      },
      {
        path: 'camunda/tasklist',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        data: { toolId: 'camunda-tasklist', roles: ['agent', 'supervisor', 'instance-admin'] },
        title: 'Camunda Tasklist'
      },
      {
        path: 'camunda/admin',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'camunda-admin' },
        title: 'Camunda Admin'
      },
      // Drools Business Rules
      {
        path: 'drools',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'drools-workbench' },
        title: 'Drools Workbench'
      },
      // Monitoring
      {
        path: 'grafana',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        data: { toolId: 'grafana', roles: ['instance-admin', 'supervisor'] },
        title: 'Grafana'
      },
      {
        path: 'kibana',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'kibana' },
        title: 'Kibana'
      },
      // Security
      {
        path: 'keycloak',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'keycloak-admin' },
        title: 'Keycloak Admin'
      },
      // Developer
      {
        path: 'api-docs',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        data: { toolId: 'swagger', roles: ['instance-admin', 'developer'] },
        title: 'API Documentation'
      },
      {
        path: 'jaeger',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'jaeger' },
        title: 'Jaeger Tracing'
      },
      // Procedure Builder Tools
      {
        path: 'bpmn-modeler',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'bpmn-modeler' },
        title: 'BPMN Modeler'
      },
      {
        path: 'dmn-editor',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'dmn-editor' },
        title: 'DMN Editor'
      },
      {
        path: 'form-builder',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        canActivate: [AdminGuard],
        data: { toolId: 'form-builder' },
        title: 'Form Builder'
      },
      // Generic route
      {
        path: ':toolId',
        loadComponent: () => import('./components/tool-frame/tool-frame.component').then(m => m.ToolFrameComponent),
        title: 'Outil'
      }
    ]
  }
];
