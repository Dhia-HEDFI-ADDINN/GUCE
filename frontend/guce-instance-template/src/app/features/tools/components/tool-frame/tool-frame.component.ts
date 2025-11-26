import { Component, Input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToolsService, Tool, ToolHealth } from '../../services/tools.service';

@Component({
  selector: 'app-tool-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-frame-container">
      <div class="tool-header">
        <div class="tool-info">
          <span class="material-icons">{{ tool()?.icon || 'extension' }}</span>
          <h2>{{ tool()?.name || 'Outil' }}</h2>
        </div>
        <div class="tool-actions">
          <span class="health-badge" [class]="health().status">{{ health().status === 'healthy' ? 'En ligne' : 'Hors ligne' }}</span>
          @if (tool()?.directUrl) {
            <button (click)="openInNewTab()"><span class="material-icons">open_in_new</span></button>
          }
          <button (click)="refresh()"><span class="material-icons">refresh</span></button>
          <button (click)="toggleFullscreen()"><span class="material-icons">{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</span></button>
        </div>
      </div>
      @if (isLoading()) {
        <div class="loading"><div class="spinner"></div><p>Chargement...</p></div>
      }
      @if (hasError()) {
        <div class="error"><span class="material-icons">error</span><p>{{ errorMessage() }}</p><button (click)="refresh()">Réessayer</button></div>
      }
      @if (accessDenied()) {
        <div class="denied"><span class="material-icons">lock</span><p>Accès refusé</p></div>
      }
      @if (!hasError() && !accessDenied()) {
        <iframe [class.hidden]="isLoading()" [class.fullscreen]="isFullscreen()" [src]="frameUrl()" (load)="onLoad()" (error)="onError()" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
      }
    </div>
  `,
  styles: [`
    .tool-frame-container { display: flex; flex-direction: column; height: 100%; }
    .tool-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #2e7d32; color: white; }
    .tool-info { display: flex; align-items: center; gap: 12px; }
    .tool-info h2 { margin: 0; font-size: 18px; }
    .tool-actions { display: flex; gap: 8px; align-items: center; }
    .tool-actions button { background: transparent; border: none; color: white; cursor: pointer; padding: 8px; }
    .health-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .health-badge.healthy { background: rgba(255,255,255,0.2); }
    .health-badge.unhealthy { background: #c62828; }
    iframe { flex: 1; border: none; width: 100%; }
    iframe.hidden { visibility: hidden; }
    iframe.fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; }
    .loading, .error, .denied { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 16px; }
    .spinner { width: 48px; height: 48px; border: 4px solid #e0e0e0; border-top-color: #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error .material-icons, .denied .material-icons { font-size: 64px; color: #f44336; }
    .denied .material-icons { color: #ff9800; }
  `]
})
export class ToolFrameComponent implements OnInit {
  @Input() toolId!: string;
  @Input() subPath?: string;

  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private toolsService = inject(ToolsService);

  tool = signal<Tool | null>(null);
  health = signal<ToolHealth>({ status: 'unknown', message: '' });
  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal('');
  accessDenied = signal(false);
  isFullscreen = signal(false);
  frameUrl = signal<SafeResourceUrl>(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));

  ngOnInit(): void {
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

  private loadTool(): void {
    if (!this.toolsService.hasToolAccess(this.toolId)) {
      this.accessDenied.set(true);
      this.isLoading.set(false);
      return;
    }
    const tool = this.toolsService.getAvailableTools().find(t => t.id === this.toolId);
    if (!tool) {
      this.hasError.set(true);
      this.errorMessage.set('Outil non trouvé');
      this.isLoading.set(false);
      return;
    }
    this.tool.set(tool);
    this.toolsService.checkToolHealth(this.toolId).subscribe(h => this.health.set(h));
    this.frameUrl.set(this.toolsService.getToolUrl(this.toolId, this.subPath));
  }

  onLoad(): void { this.isLoading.set(false); }
  onError(): void { this.isLoading.set(false); this.hasError.set(true); this.errorMessage.set('Erreur de chargement'); }
  refresh(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    const url = this.frameUrl();
    this.frameUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));
    setTimeout(() => this.frameUrl.set(url), 100);
  }
  openInNewTab(): void { if (this.tool()?.directUrl) window.open(this.tool()!.directUrl!, '_blank'); }
  toggleFullscreen(): void { this.isFullscreen.update(v => !v); }
}
