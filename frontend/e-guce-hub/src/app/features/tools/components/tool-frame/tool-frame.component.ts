import { Component, Input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolsService, Tool, ToolHealth } from '../../services/tools.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

/**
 * Generic Tool Frame Component
 * Embeds external tools via iframe with security headers and access control
 */
@Component({
  selector: 'app-tool-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-frame-container">
      <!-- Header -->
      <div class="tool-header">
        <div class="tool-info">
          <span class="material-icons tool-icon">{{ tool()?.icon || 'extension' }}</span>
          <div class="tool-title">
            <h2>{{ tool()?.name || 'Tool' }}</h2>
            <span class="tool-description">{{ tool()?.description }}</span>
          </div>
        </div>

        <div class="tool-actions">
          <!-- Health Status -->
          <div class="health-status" [class]="'status-' + health().status">
            <span class="status-dot"></span>
            <span class="status-text">{{ healthStatusText() }}</span>
          </div>

          <!-- Open in new tab -->
          @if (tool()?.directUrl) {
            <button class="action-btn" (click)="openInNewTab()" title="Ouvrir dans un nouvel onglet">
              <span class="material-icons">open_in_new</span>
            </button>
          }

          <!-- Refresh -->
          <button class="action-btn" (click)="refresh()" title="Rafraîchir">
            <span class="material-icons">refresh</span>
          </button>

          <!-- Fullscreen -->
          <button class="action-btn" (click)="toggleFullscreen()" title="Plein écran">
            <span class="material-icons">{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</span>
          </button>
        </div>
      </div>

      <!-- Sub-tools navigation -->
      @if (tool()?.subTools?.length) {
        <div class="sub-tools-nav">
          @for (subTool of tool()?.subTools; track subTool.id) {
            <button
              class="sub-tool-btn"
              [class.active]="activeSubTool() === subTool.id"
              (click)="selectSubTool(subTool)">
              {{ subTool.name }}
            </button>
          }
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>Chargement de {{ tool()?.name }}...</p>
        </div>
      }

      <!-- Error State -->
      @if (hasError()) {
        <div class="error-overlay">
          <span class="material-icons error-icon">error_outline</span>
          <h3>Impossible de charger {{ tool()?.name }}</h3>
          <p>{{ errorMessage() }}</p>
          <button class="retry-btn" (click)="refresh()">
            <span class="material-icons">refresh</span>
            Réessayer
          </button>
        </div>
      }

      <!-- Access Denied -->
      @if (accessDenied()) {
        <div class="access-denied-overlay">
          <span class="material-icons">lock</span>
          <h3>Accès refusé</h3>
          <p>Vous n'avez pas les droits nécessaires pour accéder à cet outil.</p>
        </div>
      }

      <!-- Tool Frame -->
      @if (!hasError() && !accessDenied()) {
        <iframe
          #toolFrame
          class="tool-iframe"
          [class.hidden]="isLoading()"
          [class.fullscreen]="isFullscreen()"
          [src]="frameUrl()"
          (load)="onFrameLoad()"
          (error)="onFrameError($event)"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
      }
    </div>
  `,
  styles: [`
    .tool-frame-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-color, #f5f5f5);
    }

    .tool-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: var(--primary-color, #1a237e);
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .tool-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tool-icon {
      font-size: 28px;
      opacity: 0.9;
    }

    .tool-title h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .tool-description {
      font-size: 12px;
      opacity: 0.8;
    }

    .tool-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .health-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      background: rgba(255,255,255,0.1);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-healthy .status-dot { background: #4caf50; }
    .status-unhealthy .status-dot { background: #f44336; }
    .status-unknown .status-dot { background: #ff9800; }

    .action-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .sub-tools-nav {
      display: flex;
      gap: 4px;
      padding: 8px 20px;
      background: var(--primary-dark, #0d1342);
    }

    .sub-tool-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .sub-tool-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .sub-tool-btn.active {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .tool-iframe {
      flex: 1;
      border: none;
      width: 100%;
      background: white;
    }

    .tool-iframe.hidden {
      visibility: hidden;
    }

    .tool-iframe.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
    }

    .loading-overlay,
    .error-overlay,
    .access-denied-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 16px;
      color: #666;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e0e0e0;
      border-top-color: var(--primary-color, #1a237e);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      font-size: 64px;
      color: #f44336;
    }

    .error-overlay h3,
    .access-denied-overlay h3 {
      margin: 0;
      color: #333;
    }

    .retry-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      background: var(--primary-color, #1a237e);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .retry-btn:hover {
      opacity: 0.9;
    }

    .access-denied-overlay .material-icons {
      font-size: 64px;
      color: #ff9800;
    }
  `]
})
export class ToolFrameComponent implements OnInit, OnDestroy {
  @Input() toolId!: string;
  @Input() subPath?: string;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private toolsService = inject(ToolsService);
  private authService = inject(AuthService);

  // State
  tool = signal<Tool | null>(null);
  health = signal<ToolHealth>({ status: 'unknown', message: '' });
  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal('');
  accessDenied = signal(false);
  isFullscreen = signal(false);
  activeSubTool = signal<string | null>(null);
  frameUrl = signal<SafeResourceUrl>(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));

  healthStatusText = computed(() => {
    const status = this.health().status;
    switch (status) {
      case 'healthy': return 'En ligne';
      case 'unhealthy': return 'Hors ligne';
      default: return 'Vérification...';
    }
  });

  ngOnInit(): void {
    // Get tool ID from route if not provided
    if (!this.toolId) {
      this.route.params.subscribe(params => {
        this.toolId = params['toolId'];
        this.subPath = params['subPath'];
        this.loadTool();
      });
    } else {
      this.loadTool();
    }
  }

  ngOnDestroy(): void {
    // Exit fullscreen if active
    if (this.isFullscreen()) {
      document.exitFullscreen?.();
    }
  }

  private loadTool(): void {
    // Check access
    if (!this.toolsService.hasToolAccess(this.toolId)) {
      this.accessDenied.set(true);
      this.isLoading.set(false);
      return;
    }

    // Get tool config
    const tools = this.toolsService.getAvailableTools();
    const tool = tools.find(t => t.id === this.toolId);

    if (!tool) {
      this.hasError.set(true);
      this.errorMessage.set('Outil non trouvé');
      this.isLoading.set(false);
      return;
    }

    this.tool.set(tool);

    // Set initial sub-tool if available
    if (tool.subTools?.length) {
      this.activeSubTool.set(tool.subTools[0].id);
    }

    // Check health
    this.toolsService.checkToolHealth(this.toolId).subscribe(health => {
      this.health.set(health);
    });

    // Build URL
    this.updateFrameUrl();
  }

  private updateFrameUrl(): void {
    const tool = this.tool();
    if (!tool) return;

    let path = this.subPath || '';

    // If sub-tool is active, use its path
    if (this.activeSubTool() && tool.subTools) {
      const subTool = tool.subTools.find(st => st.id === this.activeSubTool());
      if (subTool) {
        path = subTool.path;
      }
    }

    this.frameUrl.set(this.toolsService.getToolUrl(this.toolId, path));
  }

  selectSubTool(subTool: { id: string; name: string; path: string }): void {
    this.activeSubTool.set(subTool.id);
    this.isLoading.set(true);
    this.updateFrameUrl();
  }

  onFrameLoad(): void {
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  onFrameError(event: Event): void {
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set('Impossible de charger l\'outil. Vérifiez que le service est accessible.');
  }

  refresh(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    // Force iframe reload by updating URL
    const currentUrl = this.frameUrl();
    this.frameUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));
    setTimeout(() => {
      this.frameUrl.set(currentUrl);
    }, 100);
  }

  openInNewTab(): void {
    const tool = this.tool();
    if (tool?.directUrl) {
      window.open(tool.directUrl, '_blank');
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen.update(v => !v);
  }
}
