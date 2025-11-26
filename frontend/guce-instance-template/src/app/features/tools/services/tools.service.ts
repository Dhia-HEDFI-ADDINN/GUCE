import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Tools Service for GUCE Instance
 * Manages access to integrated tools (Camunda, Drools, Grafana, Kibana, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  private toolsHealth = signal<Record<string, ToolHealth>>({});

  /**
   * Get all available tools with access check
   */
  getAvailableTools(): Tool[] {
    const tools: Tool[] = [
      // Camunda - Workflow Engine
      {
        id: 'camunda-cockpit',
        name: 'Camunda Cockpit',
        description: 'Supervision des processus workflow',
        icon: 'dashboard',
        category: 'workflow',
        enabled: environment.tools.camunda.cockpit.enabled,
        proxyPath: environment.tools.camunda.cockpit.proxyPath,
        directUrl: `${environment.tools.camunda.url}${environment.tools.camunda.cockpit.path}`,
        roles: environment.toolsAccess.camundaCockpit
      },
      {
        id: 'camunda-tasklist',
        name: 'Camunda Tasklist',
        description: 'Liste des tâches en attente',
        icon: 'assignment',
        category: 'workflow',
        enabled: environment.tools.camunda.tasklist.enabled,
        proxyPath: environment.tools.camunda.tasklist.proxyPath,
        directUrl: `${environment.tools.camunda.url}${environment.tools.camunda.tasklist.path}`,
        roles: environment.toolsAccess.camundaTasklist
      },
      {
        id: 'camunda-admin',
        name: 'Camunda Admin',
        description: 'Administration du moteur workflow',
        icon: 'admin_panel_settings',
        category: 'workflow',
        enabled: environment.tools.camunda.admin.enabled,
        proxyPath: environment.tools.camunda.admin.proxyPath,
        directUrl: `${environment.tools.camunda.url}${environment.tools.camunda.admin.path}`,
        roles: environment.toolsAccess.camundaAdmin
      },
      // Drools - Business Rules
      {
        id: 'drools-workbench',
        name: 'Drools Workbench',
        description: 'Editeur de règles métier',
        icon: 'rule',
        category: 'rules',
        enabled: environment.tools.drools.workbench.enabled,
        proxyPath: environment.tools.drools.workbench.proxyPath,
        directUrl: `${environment.tools.drools.url}${environment.tools.drools.workbench.path}`,
        roles: environment.toolsAccess.droolsWorkbench
      },
      // Monitoring
      {
        id: 'grafana',
        name: 'Grafana',
        description: 'Tableaux de bord de performance',
        icon: 'monitoring',
        category: 'monitoring',
        enabled: environment.tools.grafana.enabled,
        proxyPath: environment.tools.grafana.proxyPath,
        directUrl: environment.tools.grafana.url,
        roles: environment.toolsAccess.grafana
      },
      {
        id: 'kibana',
        name: 'Kibana',
        description: 'Logs et analyses',
        icon: 'search',
        category: 'monitoring',
        enabled: environment.tools.kibana.enabled,
        proxyPath: environment.tools.kibana.proxyPath,
        directUrl: environment.tools.kibana.url,
        roles: environment.toolsAccess.kibana
      },
      // Security
      {
        id: 'keycloak-admin',
        name: 'Keycloak Admin',
        description: 'Gestion des utilisateurs et rôles',
        icon: 'people',
        category: 'security',
        enabled: environment.tools.keycloakAdmin.enabled,
        proxyPath: environment.tools.keycloakAdmin.proxyPath,
        directUrl: environment.tools.keycloakAdmin.url,
        roles: environment.toolsAccess.keycloakAdmin
      },
      // Developer Tools
      {
        id: 'swagger',
        name: 'API Documentation',
        description: 'Documentation OpenAPI/Swagger',
        icon: 'api',
        category: 'developer',
        enabled: environment.tools.swagger.enabled,
        proxyPath: environment.tools.swagger.proxyPath,
        directUrl: environment.tools.swagger.url,
        roles: environment.toolsAccess.swagger
      },
      {
        id: 'jaeger',
        name: 'Jaeger',
        description: 'Traçage des requêtes',
        icon: 'timeline',
        category: 'developer',
        enabled: environment.tools.jaeger.enabled,
        proxyPath: environment.tools.jaeger.proxyPath,
        directUrl: environment.tools.jaeger.url,
        roles: environment.toolsAccess.jaeger
      },
      // Procedure Builder Tools
      {
        id: 'bpmn-modeler',
        name: 'BPMN Modeler',
        description: 'Editeur de processus BPMN',
        icon: 'account_tree',
        category: 'procedure-builder',
        enabled: environment.procedureBuilder.bpmnModeler.enabled,
        proxyPath: environment.procedureBuilder.bpmnModeler.proxyPath,
        directUrl: null,
        roles: ['instance-admin', 'procedure-designer']
      },
      {
        id: 'dmn-editor',
        name: 'DMN Editor',
        description: 'Editeur de tables de décision',
        icon: 'table_chart',
        category: 'procedure-builder',
        enabled: environment.procedureBuilder.dmnEditor.enabled,
        proxyPath: environment.procedureBuilder.dmnEditor.proxyPath,
        directUrl: null,
        roles: ['instance-admin', 'procedure-designer']
      },
      {
        id: 'form-builder',
        name: 'Form Builder',
        description: 'Constructeur de formulaires',
        icon: 'dynamic_form',
        category: 'procedure-builder',
        enabled: environment.procedureBuilder.formBuilder.enabled,
        proxyPath: environment.procedureBuilder.formBuilder.proxyPath,
        directUrl: null,
        roles: ['instance-admin', 'procedure-designer']
      },
      {
        id: 'fee-calculator',
        name: 'Fee Calculator',
        description: 'Configurateur de tarifs',
        icon: 'calculate',
        category: 'procedure-builder',
        enabled: environment.procedureBuilder.feeCalculator.enabled,
        proxyPath: environment.procedureBuilder.feeCalculator.proxyPath,
        directUrl: null,
        roles: ['instance-admin', 'procedure-designer']
      }
    ];

    // Filter by enabled and user access
    return tools.filter(tool =>
      tool.enabled && this.hasToolAccess(tool.id)
    );
  }

  /**
   * Get tools grouped by category
   */
  getToolsByCategory(): Record<string, Tool[]> {
    const tools = this.getAvailableTools();
    return tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  }

  /**
   * Check if user has access to a tool
   */
  hasToolAccess(toolId: string): boolean {
    // Map tool IDs to access keys
    const accessMap: Record<string, string> = {
      'camunda-cockpit': 'camundaCockpit',
      'camunda-tasklist': 'camundaTasklist',
      'camunda-admin': 'camundaAdmin',
      'drools-workbench': 'droolsWorkbench',
      'grafana': 'grafana',
      'kibana': 'kibana',
      'keycloak-admin': 'keycloakAdmin',
      'prometheus': 'prometheus',
      'jaeger': 'jaeger',
      'swagger': 'swagger'
    };

    const accessKey = accessMap[toolId] || toolId;
    const toolRoles = (environment.toolsAccess as any)[accessKey] as string[];

    if (!toolRoles || toolRoles.length === 0) {
      return true;
    }

    return this.authService.hasAnyRole(toolRoles);
  }

  /**
   * Get safe URL for iframe embedding
   */
  getToolUrl(toolId: string, subPath?: string): SafeResourceUrl {
    const tool = this.getAvailableTools().find(t => t.id === toolId);
    if (!tool) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }

    let url = `${environment.api.baseUrl}${tool.proxyPath}`;
    if (subPath) {
      url += subPath;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Get Grafana dashboard URL for specific dashboard
   */
  getGrafanaDashboardUrl(dashboardKey: keyof typeof environment.tools.grafana.dashboards): SafeResourceUrl {
    const grafana = environment.tools.grafana;
    const dashboardId = grafana.dashboards[dashboardKey];
    const url = `${environment.api.baseUrl}${grafana.proxyPath}${grafana.embedPath}/${dashboardId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Get Camunda REST API base URL
   */
  getCamundaRestUrl(): string {
    return `${environment.api.baseUrl}${environment.tools.camunda.proxyPath}${environment.tools.camunda.restApi}`;
  }

  /**
   * Get Drools KIE Server URL
   */
  getDroolsKieServerUrl(): string {
    return `${environment.api.baseUrl}${environment.tools.drools.kieServer.proxyPath}`;
  }

  /**
   * Check tool health
   */
  checkToolHealth(toolId: string): Observable<ToolHealth> {
    const tool = this.getAvailableTools().find(t => t.id === toolId);
    if (!tool) {
      return of({ status: 'unknown', message: 'Tool not found' });
    }

    return this.http.get<any>(`${environment.api.baseUrl}${tool.proxyPath}/health`).pipe(
      map(() => ({ status: 'healthy' as const, message: 'OK' })),
      catchError(error => of({
        status: 'unhealthy' as const,
        message: error.message || 'Connection failed'
      }))
    );
  }

  /**
   * Check all tools health
   */
  checkAllToolsHealth(): void {
    const tools = this.getAvailableTools();
    tools.forEach(tool => {
      this.checkToolHealth(tool.id).subscribe(health => {
        this.toolsHealth.update(current => ({
          ...current,
          [tool.id]: health
        }));
      });
    });
  }

  /**
   * Get tool health
   */
  getToolHealth(toolId: string): ToolHealth {
    return this.toolsHealth()[toolId] || { status: 'unknown', message: 'Not checked' };
  }

  getAllToolsHealth(): Record<string, ToolHealth> {
    return this.toolsHealth();
  }
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
  proxyPath: string;
  directUrl: string | null;
  roles: string[];
}

export interface ToolHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
}
