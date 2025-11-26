import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MonitoringService, DashboardStats } from '@core/services/monitoring.service';
import { TenantService } from '@core/services/tenant.service';
import { Tenant, TenantStatus } from '@core/models/tenant.model';
import { AuthService } from '@core/services/auth.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface IntegratedTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  status: 'online' | 'offline' | 'unknown';
  url: string;
  internalPath: string;
  category: string;
}

interface Activity {
  type: 'success' | 'warning' | 'info' | 'error';
  icon: string;
  message: string;
  time: string;
  tenant?: string;
}

@Component({
  selector: 'hub-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule, MatRippleModule],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <span class="greeting">{{ greeting }}, {{ userName }}</span>
            <h1>Dashboard E-GUCE 3G</h1>
            <p>Vue d'ensemble de toutes les instances GUCE deployees et des metriques en temps reel</p>
          </div>
          <div class="welcome-actions">
            <a routerLink="/tenants/create" class="btn-primary" matRipple>
              <mat-icon>add</mat-icon>
              Nouvelle Instance
            </a>
            <a routerLink="/monitoring/dashboard" class="btn-secondary" matRipple>
              <mat-icon>monitoring</mat-icon>
              Monitoring 360
            </a>
          </div>
        </div>
        <div class="welcome-illustration">
          <div class="floating-card card-1">
            <mat-icon>apartment</mat-icon>
            <span>{{ stats.totalTenants }} Instances</span>
          </div>
          <div class="floating-card card-2">
            <mat-icon>check_circle</mat-icon>
            <span>{{ stats.healthyTenants }} En ligne</span>
          </div>
          <div class="floating-card card-3">
            <mat-icon>people</mat-icon>
            <span>{{ stats.totalActiveUsers | number }} Utilisateurs</span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of statCards" [class]="'stat-' + stat.type">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" [class]="stat.type">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
            <div class="stat-trend" *ngIf="stat.trend" [class]="stat.trend > 0 ? 'positive' : 'negative'">
              <mat-icon>{{ stat.trend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </div>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stat.value | number }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
          <div class="stat-sparkline" *ngIf="stat.sparkline">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
              <polyline [attr.points]="stat.sparkline" fill="none" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Tenants Section -->
          <div class="card tenants-card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon>apartment</mat-icon>
                <h2>Instances GUCE</h2>
              </div>
              <a routerLink="/tenants/dashboard" class="header-action">
                Voir tout
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
            <div class="tenant-list">
              <div class="tenant-item" *ngFor="let tenant of tenants; let i = index"
                   [style.animation-delay]="i * 0.1 + 's'"
                   (click)="navigateToTenant(tenant)"
                   matRipple>
                <div class="tenant-avatar" [style.background]="tenant.primaryColor">
                  <span>{{ tenant.code }}</span>
                </div>
                <div class="tenant-info">
                  <span class="tenant-name">{{ tenant.name }}</span>
                  <span class="tenant-domain">{{ tenant.domain }}</span>
                </div>
                <div class="tenant-metrics">
                  <div class="metric">
                    <mat-icon>people</mat-icon>
                    <span>{{ getRandomMetric(100, 500) }}</span>
                  </div>
                  <div class="metric">
                    <mat-icon>sync</mat-icon>
                    <span>{{ getRandomMetric(50, 200) }}/h</span>
                  </div>
                </div>
                <div class="tenant-status" [class]="'status-' + tenant.status.toLowerCase()">
                  <span class="status-dot"></span>
                  <span class="status-text">{{ getStatusLabel(tenant.status) }}</span>
                </div>
                <mat-icon class="tenant-arrow">chevron_right</mat-icon>
              </div>
              <div class="empty-state" *ngIf="tenants.length === 0">
                <div class="empty-icon">
                  <mat-icon>apartment</mat-icon>
                </div>
                <h3>Aucune instance deployee</h3>
                <p>Creez votre premiere instance GUCE pour commencer</p>
                <a routerLink="/tenants/create" class="btn-primary" matRipple>
                  <mat-icon>add</mat-icon>
                  Creer une instance
                </a>
              </div>
            </div>
          </div>

          <!-- Integrated Tools Section -->
          <div class="card tools-card" *ngIf="showToolsSection">
            <div class="card-header">
              <div class="header-title">
                <mat-icon>widgets</mat-icon>
                <h2>Outils Integres</h2>
              </div>
              <a routerLink="/tools" class="header-action">
                Centre de controle
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
            <div class="tools-grid">
              <div class="tool-item" *ngFor="let tool of integratedTools.slice(0, 6)"
                   [class.online]="tool.status === 'online'"
                   (click)="openTool(tool)"
                   matRipple>
                <div class="tool-icon" [style.background]="tool.gradient">
                  <mat-icon>{{ tool.icon }}</mat-icon>
                </div>
                <div class="tool-info">
                  <span class="tool-name">{{ tool.name }}</span>
                  <span class="tool-desc">{{ tool.description }}</span>
                </div>
                <div class="tool-status">
                  <span class="status-indicator" [class]="tool.status"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Activity Feed -->
          <div class="card activity-card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon>history</mat-icon>
                <h2>Activite Recente</h2>
              </div>
              <div class="live-indicator">
                <span class="live-dot"></span>
                En direct
              </div>
            </div>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivities; let i = index"
                   [style.animation-delay]="i * 0.08 + 's'">
                <div class="activity-icon" [class]="activity.type">
                  <mat-icon>{{ activity.icon }}</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-message">{{ activity.message }}</p>
                  <div class="activity-meta">
                    <span class="activity-tenant" *ngIf="activity.tenant">{{ activity.tenant }}</span>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Cards -->
          <div class="metrics-row">
            <div class="card metric-card">
              <div class="metric-header">
                <mat-icon>receipt_long</mat-icon>
                <span>Transactions</span>
              </div>
              <div class="metric-value">
                <span class="value">{{ stats.totalTransactionsToday | number }}</span>
                <span class="trend positive">
                  <mat-icon>trending_up</mat-icon>
                  +12%
                </span>
              </div>
              <div class="metric-chart">
                <div class="chart-bar" *ngFor="let h of chartHours" [style.height.%]="h"></div>
              </div>
            </div>

            <div class="card metric-card">
              <div class="metric-header">
                <mat-icon>speed</mat-icon>
                <span>Temps de reponse</span>
              </div>
              <div class="metric-value">
                <span class="value">{{ stats.averageResponseTime }}ms</span>
                <span class="trend negative">
                  <mat-icon>trending_down</mat-icon>
                  -8%
                </span>
              </div>
              <div class="metric-progress">
                <div class="progress-bar" [style.width.%]="Math.min(stats.averageResponseTime / 5, 100)"></div>
              </div>
              <span class="metric-note">Objectif: < 500ms</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card quick-actions-card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon>bolt</mat-icon>
                <h2>Actions Rapides</h2>
              </div>
            </div>
            <div class="actions-grid">
              <a *ngFor="let action of quickActions"
                 [routerLink]="action.route"
                 class="action-item"
                 matRipple>
                <div class="action-icon" [style.background]="action.gradient">
                  <mat-icon>{{ action.icon }}</mat-icon>
                </div>
                <span class="action-label">{{ action.label }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host {
      --color-primary: #6366f1;
      --color-primary-light: rgba(99, 102, 241, 0.1);
      --color-success: #10b981;
      --color-success-light: rgba(16, 185, 129, 0.1);
      --color-warning: #f59e0b;
      --color-warning-light: rgba(245, 158, 11, 0.1);
      --color-error: #ef4444;
      --color-error-light: rgba(239, 68, 68, 0.1);
      --color-info: #3b82f6;
      --color-info-light: rgba(59, 130, 246, 0.1);
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --border-color: #e2e8f0;
      --card-bg: #ffffff;
      --page-bg: #f8fafc;
    }

    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--page-bg);
      min-height: 100vh;
    }

    /* Welcome Section */
    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px 40px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      border-radius: 24px;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        pointer-events: none;
      }
    }

    .welcome-content {
      position: relative;
      z-index: 1;
    }

    .welcome-text {
      color: white;

      .greeting {
        display: block;
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
        font-weight: 500;
      }

      h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
        letter-spacing: -0.5px;
      }

      p {
        font-size: 15px;
        opacity: 0.85;
        margin: 0;
        max-width: 400px;
        line-height: 1.5;
      }
    }

    .welcome-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;

      .btn-primary, .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .btn-primary {
        background: white;
        color: var(--color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        backdrop-filter: blur(8px);

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      }
    }

    .welcome-illustration {
      position: relative;
      width: 300px;
      height: 200px;
      z-index: 1;
    }

    .floating-card {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      animation: float 3s ease-in-out infinite;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--color-primary);
      }

      &.card-1 {
        top: 0;
        left: 0;
        animation-delay: 0s;
      }

      &.card-2 {
        top: 60px;
        right: 0;
        animation-delay: 0.5s;

        mat-icon { color: var(--color-success); }
      }

      &.card-3 {
        bottom: 20px;
        left: 40px;
        animation-delay: 1s;

        mat-icon { color: var(--color-info); }
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border: 1px solid var(--border-color);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
      }
    }

    .stat-icon-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      &.primary {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }

      &.success {
        background: var(--color-success-light);
        color: var(--color-success);
      }

      &.warning {
        background: var(--color-warning-light);
        color: var(--color-warning);
      }

      &.error {
        background: var(--color-error-light);
        color: var(--color-error);
      }
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &.positive {
        background: var(--color-success-light);
        color: var(--color-success);
      }

      &.negative {
        background: var(--color-error-light);
        color: var(--color-error);
      }
    }

    .stat-content {
      .stat-value {
        display: block;
        font-size: 32px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
      }
    }

    .stat-sparkline {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      opacity: 0.2;

      svg {
        width: 100%;
        height: 100%;

        polyline {
          stroke: var(--color-primary);
        }
      }
    }

    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 24px;
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border-radius: 20px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);

      .header-title {
        display: flex;
        align-items: center;
        gap: 10px;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
          color: var(--color-primary);
        }

        h2 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
      }

      .header-action {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-primary);
        text-decoration: none;
        transition: gap 0.2s;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        &:hover {
          gap: 8px;
        }
      }
    }

    /* Tenants */
    .tenants-card {
      margin-bottom: 24px;
    }

    .tenant-list {
      padding: 8px;
    }

    .tenant-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
      animation: slideIn 0.3s ease-out forwards;
      opacity: 0;

      &:hover {
        background: #f8fafc;

        .tenant-arrow {
          opacity: 1;
          transform: translateX(0);
        }
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .tenant-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .tenant-info {
      flex: 1;
      min-width: 0;

      .tenant-name {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      .tenant-domain {
        display: block;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }

    .tenant-metrics {
      display: flex;
      gap: 16px;

      .metric {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--text-secondary);

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    .tenant-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.status-running {
        background: var(--color-success-light);
        color: var(--color-success);

        .status-dot { background: var(--color-success); }
      }

      &.status-maintenance {
        background: var(--color-warning-light);
        color: var(--color-warning);

        .status-dot { background: var(--color-warning); }
      }

      &.status-stopped, &.status-error {
        background: var(--color-error-light);
        color: var(--color-error);

        .status-dot { background: var(--color-error); }
      }
    }

    .tenant-arrow {
      color: var(--text-muted);
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.2s;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      text-align: center;

      .empty-icon {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--color-primary);
        }
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0 0 24px;
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: var(--color-primary);
        color: white;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
      }
    }

    /* Tools Grid */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px;
    }

    .tool-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: #f8fafc;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--color-primary-light);
        transform: translateX(4px);
      }

      &.online {
        .status-indicator { background: var(--color-success); }
      }
    }

    .tool-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .tool-info {
      flex: 1;
      min-width: 0;

      .tool-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .tool-desc {
        display: block;
        font-size: 11px;
        color: var(--text-secondary);
      }
    }

    .tool-status {
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
      }
    }

    /* Activity Feed */
    .activity-card {
      margin-bottom: 20px;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-success);

      .live-dot {
        width: 8px;
        height: 8px;
        background: var(--color-success);
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .activity-list {
      padding: 8px 16px;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      animation: slideIn 0.3s ease-out forwards;
      opacity: 0;

      &:last-child { border-bottom: none; }
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.success {
        background: var(--color-success-light);
        color: var(--color-success);
      }

      &.warning {
        background: var(--color-warning-light);
        color: var(--color-warning);
      }

      &.info {
        background: var(--color-info-light);
        color: var(--color-info);
      }

      &.error {
        background: var(--color-error-light);
        color: var(--color-error);
      }
    }

    .activity-content {
      flex: 1;

      .activity-message {
        font-size: 13px;
        color: var(--text-primary);
        margin: 0 0 4px;
        line-height: 1.4;
      }

      .activity-meta {
        display: flex;
        gap: 8px;
        font-size: 11px;
        color: var(--text-muted);

        .activity-tenant {
          color: var(--color-primary);
          font-weight: 500;
        }
      }
    }

    /* Metrics Row */
    .metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .metric-card {
      padding: 20px;

      .metric-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .metric-value {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 16px;

        .value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          font-weight: 600;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }

          &.positive { color: var(--color-success); }
          &.negative { color: var(--color-error); }
        }
      }

      .metric-chart {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 40px;

        .chart-bar {
          flex: 1;
          background: linear-gradient(180deg, var(--color-primary) 0%, rgba(99, 102, 241, 0.3) 100%);
          border-radius: 4px 4px 0 0;
          min-height: 4px;
        }
      }

      .metric-progress {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-success) 0%, var(--color-warning) 100%);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }

      .metric-note {
        display: block;
        margin-top: 8px;
        font-size: 11px;
        color: var(--text-muted);
      }
    }

    /* Quick Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px;
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      background: #f8fafc;
      border-radius: 14px;
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        background: var(--color-primary-light);
        transform: translateY(-2px);
      }
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .action-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .tools-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .welcome-illustration {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 16px;
      }

      .welcome-section {
        padding: 24px;
      }

      .welcome-text h1 {
        font-size: 24px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .metrics-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private monitoringService = inject(MonitoringService);
  private tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  Math = Math;

  userName = 'Admin';
  greeting = '';
  showToolsSection = false;

  stats: DashboardStats = {
    totalTenants: 0,
    healthyTenants: 0,
    degradedTenants: 0,
    unhealthyTenants: 0,
    activeAlerts: 0,
    totalTransactionsToday: 0,
    totalActiveUsers: 0,
    averageResponseTime: 0
  };

  statCards: Array<{
    icon: string;
    label: string;
    value: number;
    type: string;
    trend?: number;
    sparkline?: string;
  }> = [];

  tenants: Tenant[] = [];
  chartHours: number[] = [];

  integratedTools: IntegratedTool[] = [
    {
      id: 'grafana',
      name: 'Grafana',
      description: 'Dashboards & Monitoring',
      icon: 'dashboard',
      color: '#F46800',
      gradient: 'linear-gradient(135deg, #F46800, #FF9A44)',
      status: 'online',
      url: 'http://localhost:3000',
      internalPath: '/tools/grafana',
      category: 'monitoring'
    },
    {
      id: 'kibana',
      name: 'Kibana',
      description: 'Logs & Analytics',
      icon: 'search',
      color: '#005571',
      gradient: 'linear-gradient(135deg, #005571, #00A3E0)',
      status: 'online',
      url: 'http://localhost:5601',
      internalPath: '/tools/kibana',
      category: 'monitoring'
    },
    {
      id: 'keycloak',
      name: 'Keycloak',
      description: 'Identity & Access',
      icon: 'admin_panel_settings',
      color: '#4D4D4D',
      gradient: 'linear-gradient(135deg, #4D4D4D, #7D7D7D)',
      status: 'online',
      url: 'http://localhost:8180/admin',
      internalPath: '/tools/keycloak-admin',
      category: 'security'
    },
    {
      id: 'camunda',
      name: 'Camunda',
      description: 'Workflow Engine',
      icon: 'account_tree',
      color: '#FC5D0D',
      gradient: 'linear-gradient(135deg, #FC5D0D, #FD9A58)',
      status: 'online',
      url: 'http://localhost:8081',
      internalPath: '/tools/camunda',
      category: 'workflow'
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      description: 'Metrics & Alerting',
      icon: 'analytics',
      color: '#E6522C',
      gradient: 'linear-gradient(135deg, #E6522C, #FF7F5C)',
      status: 'online',
      url: 'http://localhost:9090',
      internalPath: '/tools/prometheus',
      category: 'monitoring'
    },
    {
      id: 'minio',
      name: 'MinIO',
      description: 'Object Storage',
      icon: 'cloud_upload',
      color: '#C72C48',
      gradient: 'linear-gradient(135deg, #C72C48, #FF5C7A)',
      status: 'online',
      url: 'http://localhost:9001',
      internalPath: '/tools/minio',
      category: 'storage'
    }
  ];

  recentActivities: Activity[] = [
    { type: 'success', icon: 'check_circle', message: 'GUCE Cameroun deploye avec succes', time: 'Il y a 5 min', tenant: 'GUCE-CM' },
    { type: 'info', icon: 'code', message: 'Generation procedure Import terminee', time: 'Il y a 15 min' },
    { type: 'warning', icon: 'warning', message: 'Utilisation CPU elevee detectee', time: 'Il y a 30 min', tenant: 'GUCE-TD' },
    { type: 'success', icon: 'person_add', message: 'Nouvel utilisateur cree', time: 'Il y a 1h', tenant: 'GUCE-RCA' },
    { type: 'info', icon: 'sync', message: 'Synchronisation templates terminee', time: 'Il y a 2h' },
    { type: 'success', icon: 'cloud_done', message: 'Backup automatique complete', time: 'Il y a 3h' }
  ];

  quickActions = [
    { icon: 'add_circle', label: 'Nouvelle Instance', route: '/tenants/create', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { icon: 'code', label: 'Generer Procedure', route: '/generator/procedures', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { icon: 'monitoring', label: 'Monitoring 360', route: '/monitoring/dashboard', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { icon: 'library_books', label: 'Templates', route: '/templates/procedures/import', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }
  ];

  ngOnInit(): void {
    this.setGreeting();
    this.loadDashboardData();
    this.checkToolsAccess();
    this.generateChartData();

    // Refresh every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadDashboardData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Bonjour';
    } else if (hour < 18) {
      this.greeting = 'Bon apres-midi';
    } else {
      this.greeting = 'Bonsoir';
    }
  }

  loadDashboardData(): void {
    this.stats = {
      totalTenants: 5,
      healthyTenants: 3,
      degradedTenants: 1,
      unhealthyTenants: 1,
      activeAlerts: 3,
      totalTransactionsToday: 12458,
      totalActiveUsers: 847,
      averageResponseTime: 245
    };

    this.statCards = [
      {
        icon: 'apartment',
        label: 'Total Instances',
        value: this.stats.totalTenants,
        type: 'primary',
        trend: 8,
        sparkline: '0,30 15,20 30,25 45,15 60,22 75,18 90,28 100,20'
      },
      {
        icon: 'check_circle',
        label: 'Instances Saines',
        value: this.stats.healthyTenants,
        type: 'success',
        trend: 5
      },
      {
        icon: 'warning',
        label: 'En Maintenance',
        value: this.stats.degradedTenants,
        type: 'warning',
        trend: -2
      },
      {
        icon: 'notifications_active',
        label: 'Alertes Actives',
        value: this.stats.activeAlerts,
        type: 'error',
        trend: 12
      }
    ];

    this.tenants = [
      {
        id: '1',
        code: 'CM',
        name: 'GUCE Cameroun',
        shortName: 'GUCE-CM',
        domain: 'guce-cameroun.com',
        country: 'CM',
        primaryColor: '#1E5631',
        secondaryColor: '#CE1126',
        timezone: 'Africa/Douala',
        locale: 'fr-CM',
        currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      },
      {
        id: '2',
        code: 'TD',
        name: 'GUCE Tchad',
        shortName: 'GUCE-TD',
        domain: 'guce-tchad.com',
        country: 'TD',
        primaryColor: '#002664',
        secondaryColor: '#FECB00',
        timezone: 'Africa/Ndjamena',
        locale: 'fr-TD',
        currency: 'XAF',
        status: TenantStatus.RUNNING,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      },
      {
        id: '3',
        code: 'CF',
        name: 'GUCE RCA',
        shortName: 'GUCE-CF',
        domain: 'guce-rca.com',
        country: 'CF',
        primaryColor: '#003082',
        secondaryColor: '#289728',
        timezone: 'Africa/Bangui',
        locale: 'fr-CF',
        currency: 'XAF',
        status: TenantStatus.MAINTENANCE,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        infrastructure: {} as any
      }
    ];
  }

  checkToolsAccess(): void {
    this.showToolsSection = this.authService.hasAnyRole([
      'SUPER_ADMIN',
      'hub-admin',
      'monitoring-viewer',
      'workflow-admin',
      'rules-admin',
      'developer'
    ]);
  }

  generateChartData(): void {
    this.chartHours = Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20);
  }

  getRandomMetric(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getStatusLabel(status: TenantStatus): string {
    const labels: Record<TenantStatus, string> = {
      [TenantStatus.PENDING]: 'En attente',
      [TenantStatus.PROVISIONING]: 'Provisionnement',
      [TenantStatus.RUNNING]: 'En ligne',
      [TenantStatus.STOPPED]: 'Arrete',
      [TenantStatus.ERROR]: 'Erreur',
      [TenantStatus.MAINTENANCE]: 'Maintenance'
    };
    return labels[status] || status;
  }

  navigateToTenant(tenant: Tenant): void {
    this.router.navigate(['/tenants', tenant.id]);
  }

  openTool(tool: IntegratedTool): void {
    window.open(tool.url, '_blank');
  }
}
