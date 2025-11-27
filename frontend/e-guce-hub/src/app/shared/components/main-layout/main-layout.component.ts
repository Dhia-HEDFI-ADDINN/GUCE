import { Component, OnInit, OnDestroy, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { Subject } from 'rxjs';
import { filter, takeUntil, map, mergeMap } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'hub-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressBarModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <!-- Loading Bar -->
    <mat-progress-bar *ngIf="isLoading()" mode="indeterminate" class="global-loading"></mat-progress-bar>

    <!-- Sidebar -->
    <hub-sidebar
      [collapsed]="sidebarCollapsed()"
      [mobileOpen]="mobileMenuOpen()"
      (toggleCollapse)="toggleSidebar()"
      (mobileClose)="closeMobileMenu()">
    </hub-sidebar>

    <!-- Main Content Area -->
    <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Header -->
      <hub-header
        [sidebarCollapsed]="sidebarCollapsed()"
        [pageTitle]="pageTitle()"
        [breadcrumbs]="breadcrumbs()"
        (toggleSidebar)="toggleMobileMenu()">
      </hub-header>

      <!-- Page Content -->
      <div class="page-content">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer -->
      <footer class="main-footer">
        <div class="footer-content">
          <div class="footer-left">
            <span class="copyright">© 2024 E-GUCE 3G Hub</span>
            <span class="separator">|</span>
            <span class="version">v3.0.0</span>
          </div>
          <div class="footer-right">
            <a href="https://docs.e-guce.com" target="_blank" class="footer-link">Documentation</a>
            <a href="https://support.e-guce.com" target="_blank" class="footer-link">Support</a>
            <a href="/admin/settings/general" class="footer-link">Parametres</a>
          </div>
        </div>
      </footer>
    </main>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-overlay"
         *ngIf="mobileMenuOpen()"
         (click)="closeMobileMenu()">
    </div>

    <!-- Quick Actions FAB (mobile) -->
    <button class="fab-button" *ngIf="isMobile()" (click)="toggleQuickActions()">
      <mat-icon>{{ quickActionsOpen() ? 'close' : 'add' }}</mat-icon>
    </button>

    <!-- Quick Actions Menu -->
    <div class="quick-actions-menu" *ngIf="quickActionsOpen()">
      <a routerLink="/tenants/create" class="quick-action-item" (click)="quickActionsOpen.set(false)">
        <mat-icon>apartment</mat-icon>
        <span>Nouveau Tenant</span>
      </a>
      <a routerLink="/generator/procedures" class="quick-action-item" (click)="quickActionsOpen.set(false)">
        <mat-icon>account_tree</mat-icon>
        <span>Nouvelle Procedure</span>
      </a>
      <a routerLink="/templates/workflows" class="quick-action-item" (click)="quickActionsOpen.set(false)">
        <mat-icon>schema</mat-icon>
        <span>Nouveau Workflow</span>
      </a>
      <a routerLink="/monitoring/dashboard" class="quick-action-item" (click)="quickActionsOpen.set(false)">
        <mat-icon>monitoring</mat-icon>
        <span>Monitoring</span>
      </a>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      display: block;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --sidebar-width: 280px;
      --sidebar-collapsed-width: 72px;
      --header-height: 72px;
      --accent-color: #6366f1;
      --accent-light: rgba(99, 102, 241, 0.1);
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
    }

    .global-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      height: 3px;
    }

    .main-content {
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.sidebar-collapsed {
        margin-left: var(--sidebar-collapsed-width);
      }
    }

    .page-content {
      flex: 1;
      padding: 24px;
      max-width: 1800px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .main-footer {
      background: var(--bg-secondary);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      padding: 16px 24px;
      margin-top: auto;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1800px;
      margin: 0 auto;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--text-secondary);

      .separator {
        opacity: 0.3;
      }

      .version {
        padding: 2px 8px;
        background: var(--accent-light);
        color: var(--accent-color);
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
    }

    .footer-right {
      display: flex;
      gap: 24px;
    }

    .footer-link {
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--accent-color);
      }
    }

    .mobile-overlay {
      display: none;
    }

    .fab-button {
      display: none;
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      z-index: 100;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
      }

      &:active {
        transform: scale(0.95);
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        transition: transform 0.3s ease;
      }
    }

    .quick-actions-menu {
      display: none;
      position: fixed;
      bottom: 96px;
      right: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      padding: 8px;
      z-index: 100;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .quick-action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: var(--accent-light);
        color: var(--accent-color);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-secondary);
      }

      &:hover mat-icon {
        color: var(--accent-color);
      }

      span {
        font-size: 14px;
        font-weight: 500;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .main-content {
        margin-left: 0;

        &.sidebar-collapsed {
          margin-left: 0;
        }
      }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 900;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .fab-button,
      .quick-actions-menu {
        display: flex;
      }
    }

    @media (max-width: 768px) {
      .page-content {
        padding: 16px;
      }

      .main-footer {
        padding: 12px 16px;
      }

      .footer-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .footer-right {
        gap: 16px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    /* Dark mode */
    :host-context(.dark) {
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
    }

    :host-context(.dark) .main-footer {
      border-top-color: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Signals for state management
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  isLoading = signal(false);
  pageTitle = signal('Dashboard');
  breadcrumbs = signal<BreadcrumbItem[]>([]);
  isMobile = signal(false);
  quickActionsOpen = signal(false);

  // Listen for window resize
  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
    if (!this.isMobile()) {
      this.mobileMenuOpen.set(false);
      this.quickActionsOpen.set(false);
    }
  }

  // Listen for keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Toggle sidebar with Cmd/Ctrl + B
    if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
      event.preventDefault();
      this.toggleSidebar();
    }
    // Close mobile menu with Escape
    if (event.key === 'Escape') {
      this.mobileMenuOpen.set(false);
      this.quickActionsOpen.set(false);
    }
  }

  ngOnInit() {
    this.checkMobile();
    this.setupRouteListener();

    // Load saved sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      this.sidebarCollapsed.set(savedState === 'true');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkMobile() {
    this.isMobile.set(window.innerWidth <= 1024);
  }

  private setupRouteListener() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data['title']) {
        this.pageTitle.set(data['title']);
      }
      if (data['breadcrumbs']) {
        this.breadcrumbs.set(data['breadcrumbs']);
      }
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
    localStorage.setItem('sidebarCollapsed', String(this.sidebarCollapsed()));
  }

  toggleMobileMenu() {
    if (this.isMobile()) {
      this.mobileMenuOpen.update(v => !v);
    } else {
      this.toggleSidebar();
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleQuickActions() {
    this.quickActionsOpen.update(v => !v);
  }
}
