import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToolsService, Tool, ToolHealth } from '../../services/tools.service';

/**
 * Tools Dashboard Component
 * Shows all available tools with health status and quick access
 */
@Component({
  selector: 'app-tools-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="tools-dashboard">
      <header class="dashboard-header">
        <h1>Centre de contrôle</h1>
        <p>Accédez à tous les outils d'administration et de supervision</p>
      </header>

      <!-- Health Summary -->
      <div class="health-summary">
        <div class="health-card healthy">
          <span class="material-icons">check_circle</span>
          <div class="health-info">
            <span class="health-count">{{ healthyCount() }}</span>
            <span class="health-label">En ligne</span>
          </div>
        </div>
        <div class="health-card unhealthy">
          <span class="material-icons">error</span>
          <div class="health-info">
            <span class="health-count">{{ unhealthyCount() }}</span>
            <span class="health-label">Hors ligne</span>
          </div>
        </div>
        <div class="health-card unknown">
          <span class="material-icons">help</span>
          <div class="health-info">
            <span class="health-count">{{ unknownCount() }}</span>
            <span class="health-label">Inconnu</span>
          </div>
        </div>
        <button class="refresh-all-btn" (click)="refreshHealth()">
          <span class="material-icons">refresh</span>
          Actualiser
        </button>
      </div>

      <!-- Tools by Category -->
      @for (category of categories(); track category) {
        <section class="tools-category">
          <h2 class="category-title">
            <span class="material-icons">{{ getCategoryIcon(category) }}</span>
            {{ getCategoryName(category) }}
          </h2>

          <div class="tools-grid">
            @for (tool of getToolsForCategory(category); track tool.id) {
              <div class="tool-card" [class]="'status-' + getToolHealth(tool.id).status">
                <div class="tool-card-header">
                  <span class="material-icons tool-icon">{{ tool.icon }}</span>
                  <div class="tool-status">
                    <span class="status-dot"></span>
                  </div>
                </div>

                <div class="tool-card-body">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                </div>

                <div class="tool-card-footer">
                  @if (tool.subTools?.length) {
                    <div class="sub-tools">
                      @for (subTool of tool.subTools; track subTool.id) {
                        <a
                          [routerLink]="['/tools', tool.id, subTool.id]"
                          class="sub-tool-link">
                          {{ subTool.name }}
                        </a>
                      }
                    </div>
                  } @else {
                    <a [routerLink]="['/tools', tool.id]" class="open-btn">
                      <span class="material-icons">launch</span>
                      Ouvrir
                    </a>
                  }

                  @if (tool.directUrl) {
                    <button class="external-btn" (click)="openExternal(tool)" title="Ouvrir dans un nouvel onglet">
                      <span class="material-icons">open_in_new</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <button class="action-card" (click)="navigateTo('/tools/grafana')">
            <span class="material-icons">dashboard</span>
            <span>Voir les dashboards</span>
          </button>
          <button class="action-card" (click)="navigateTo('/tools/kibana')">
            <span class="material-icons">search</span>
            <span>Rechercher dans les logs</span>
          </button>
          <button class="action-card" (click)="navigateTo('/tools/keycloak-admin')">
            <span class="material-icons">person_add</span>
            <span>Gérer les utilisateurs</span>
          </button>
          <button class="action-card" (click)="navigateTo('/generator')">
            <span class="material-icons">add_box</span>
            <span>Générer une instance</span>
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .tools-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      margin: 0 0 8px;
      font-size: 28px;
      color: #1a237e;
    }

    .dashboard-header p {
      margin: 0;
      color: #666;
    }

    /* Health Summary */
    .health-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .health-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .health-card.healthy { background: #e8f5e9; color: #2e7d32; }
    .health-card.unhealthy { background: #ffebee; color: #c62828; }
    .health-card.unknown { background: #fff3e0; color: #ef6c00; }

    .health-card .material-icons {
      font-size: 32px;
    }

    .health-info {
      display: flex;
      flex-direction: column;
    }

    .health-count {
      font-size: 24px;
      font-weight: 600;
    }

    .health-label {
      font-size: 12px;
      opacity: 0.8;
    }

    .refresh-all-btn {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      background: #1a237e;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .refresh-all-btn:hover {
      background: #0d1342;
    }

    /* Category */
    .tools-category {
      margin-bottom: 32px;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
      font-size: 18px;
      color: #333;
    }

    .category-title .material-icons {
      color: #1a237e;
    }

    /* Tools Grid */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .tool-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .tool-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .tool-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
      color: white;
    }

    .tool-icon {
      font-size: 36px;
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ff9800;
    }

    .status-healthy .status-dot { background: #4caf50; }
    .status-unhealthy .status-dot { background: #f44336; }

    .tool-card-body {
      padding: 16px;
    }

    .tool-card-body h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #333;
    }

    .tool-card-body p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .tool-card-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
    }

    .sub-tools {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;
    }

    .sub-tool-link {
      padding: 6px 12px;
      background: #e8eaf6;
      color: #1a237e;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      transition: background 0.2s;
    }

    .sub-tool-link:hover {
      background: #c5cae9;
    }

    .open-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #1a237e;
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-size: 13px;
      transition: background 0.2s;
    }

    .open-btn:hover {
      background: #0d1342;
    }

    .external-btn {
      padding: 8px;
      border: 1px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;
    }

    .external-btn:hover {
      border-color: #1a237e;
      color: #1a237e;
    }

    /* Quick Actions */
    .quick-actions {
      margin-top: 32px;
    }

    .quick-actions h2 {
      margin: 0 0 16px;
      font-size: 18px;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .action-card:hover {
      border-color: #1a237e;
      background: #f5f5f5;
    }

    .action-card .material-icons {
      font-size: 24px;
      color: #1a237e;
    }

    .action-card span:last-child {
      font-size: 14px;
      color: #333;
    }
  `]
})
export class ToolsDashboardComponent implements OnInit {
  private toolsService = inject(ToolsService);
  private router = inject(Router);

  toolsByCategory = signal<Record<string, Tool[]>>({});
  toolsHealth = signal<Record<string, ToolHealth>>({});

  categories = computed(() => Object.keys(this.toolsByCategory()));

  healthyCount = computed(() => {
    const health = this.toolsHealth();
    return Object.values(health).filter(h => h.status === 'healthy').length;
  });

  unhealthyCount = computed(() => {
    const health = this.toolsHealth();
    return Object.values(health).filter(h => h.status === 'unhealthy').length;
  });

  unknownCount = computed(() => {
    const tools = this.toolsService.getAvailableTools();
    return tools.length - this.healthyCount() - this.unhealthyCount();
  });

  ngOnInit(): void {
    this.loadTools();
    this.refreshHealth();
  }

  private loadTools(): void {
    this.toolsByCategory.set(this.toolsService.getToolsByCategory());
  }

  refreshHealth(): void {
    this.toolsService.checkAllToolsHealth();
    // Update local state after a delay
    setTimeout(() => {
      this.toolsHealth.set(this.toolsService.getAllToolsHealth());
    }, 2000);
  }

  getToolsForCategory(category: string): Tool[] {
    return this.toolsByCategory()[category] || [];
  }

  getToolHealth(toolId: string): ToolHealth {
    return this.toolsHealth()[toolId] || { status: 'unknown', message: '' };
  }

  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      monitoring: 'Monitoring & Logs',
      security: 'Sécurité & Identité',
      generator: 'Générateur',
      workflow: 'Workflow',
      rules: 'Règles métier',
      developer: 'Développeur'
    };
    return names[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      monitoring: 'monitoring',
      security: 'security',
      generator: 'build',
      workflow: 'account_tree',
      rules: 'rule',
      developer: 'code'
    };
    return icons[category] || 'extension';
  }

  openExternal(tool: Tool): void {
    if (tool.directUrl) {
      window.open(tool.directUrl, '_blank');
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
