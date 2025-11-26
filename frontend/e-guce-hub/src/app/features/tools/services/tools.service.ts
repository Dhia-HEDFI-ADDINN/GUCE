import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Tools Service for E-GUCE Hub
 * Manages access to integrated tools (Grafana, Kibana, Keycloak Admin, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  // Tool health status
  private toolsHealth = signal<Record<string, ToolHealth>>({});

  /**
   * Get all available tools with access check
   */
  getAvailableTools(): Tool[] {
    const tools: Tool[] = [
      {
        id: 'grafana',
        name: 'Grafana',
        description: 'Tableaux de bord et monitoring',
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
      {
        id: 'keycloak-admin',
        name: 'Keycloak Admin',
        description: 'Gestion des identités',
        icon: 'admin_panel_settings',
        category: 'security',
        enabled: environment.tools.keycloakAdmin.enabled,
        proxyPath: environment.tools.keycloakAdmin.proxyPath,
        directUrl: environment.tools.keycloakAdmin.url,
        roles: environment.toolsAccess.keycloakAdmin
      },
      {
        id: 'configurator',
        name: 'Configurator',
        description: 'Générateur d\'instances GUCE',
        icon: 'build',
        category: 'generator',
        enabled: environment.tools.configurator.enabled,
        proxyPath: environment.tools.configurator.proxyPath,
        directUrl: null,
        roles: environment.toolsAccess.configurator
      },
      {
        id: 'camunda',
        name: 'Camunda',
        description: 'Moteur de workflow',
        icon: 'account_tree',
        category: 'workflow',
        enabled: environment.tools.camunda.enabled,
        proxyPath: environment.tools.camunda.proxyPath,
        directUrl: environment.tools.camunda.url,
        roles: environment.toolsAccess.camunda,
        subTools: [
          { id: 'camunda-cockpit', name: 'Cockpit', path: environment.tools.camunda.cockpitPath },
          { id: 'camunda-tasklist', name: 'Tasklist', path: environment.tools.camunda.tasklistPath },
          { id: 'camunda-admin', name: 'Admin', path: environment.tools.camunda.adminPath }
        ]
      },
      {
        id: 'drools',
        name: 'Drools',
        description: 'Moteur de règles métier',
        icon: 'rule',
        category: 'rules',
        enabled: environment.tools.drools.enabled,
        proxyPath: environment.tools.drools.proxyPath,
        directUrl: environment.tools.drools.url,
        roles: environment.toolsAccess.drools
      },
      {
        id: 'prometheus',
        name: 'Prometheus',
        description: 'Métriques système',
        icon: 'analytics',
        category: 'monitoring',
        enabled: environment.tools.prometheus.enabled,
        proxyPath: environment.tools.prometheus.proxyPath,
        directUrl: environment.tools.prometheus.url,
        roles: environment.toolsAccess.prometheus
      },
      {
        id: 'jaeger',
        name: 'Jaeger',
        description: 'Traçage distribué',
        icon: 'timeline',
        category: 'monitoring',
        enabled: environment.tools.jaeger.enabled,
        proxyPath: environment.tools.jaeger.proxyPath,
        directUrl: environment.tools.jaeger.url,
        roles: environment.toolsAccess.jaeger
      },
      {
        id: 'swagger',
        name: 'API Docs',
        description: 'Documentation OpenAPI',
        icon: 'api',
        category: 'developer',
        enabled: environment.tools.swagger.enabled,
        proxyPath: environment.tools.swagger.proxyPath,
        directUrl: environment.tools.swagger.url,
        roles: environment.toolsAccess.swagger
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
    const toolRoles = (environment.toolsAccess as any)[toolId] as string[];
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

    // Build URL - prefer proxy path for security
    let url = `${environment.api.baseUrl}${tool.proxyPath}`;
    if (subPath) {
      url += subPath;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Get Grafana dashboard URL
   */
  getGrafanaDashboardUrl(dashboardId: string, params?: Record<string, string>): SafeResourceUrl {
    const grafana = environment.tools.grafana;
    let url = `${environment.api.baseUrl}${grafana.proxyPath}${grafana.embedPath}/${dashboardId}`;

    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Check tool health status
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
   * Get tool health status
   */
  getToolHealth(toolId: string): ToolHealth {
    return this.toolsHealth()[toolId] || { status: 'unknown', message: 'Not checked' };
  }

  /**
   * Get all tools health
   */
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
  subTools?: { id: string; name: string; path: string }[];
}

export interface ToolHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
}
