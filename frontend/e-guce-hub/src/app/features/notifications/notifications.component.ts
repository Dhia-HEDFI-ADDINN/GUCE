import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '@core/services/notification.service';
import { Notification, NotificationLevel } from '@core/models/notification.model';

@Component({
  selector: 'hub-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatChipsModule
  ],
  template: `
    <div class="notifications-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Notifications</h1>
          <p class="subtitle">Consultez et gerez toutes vos notifications</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button *ngIf="unreadCount() > 0" (click)="markAllAsRead()">
            <mat-icon>done_all</mat-icon>
            Tout marquer comme lu
          </button>
          <button mat-stroked-button [matMenuTriggerFor]="settingsMenu">
            <mat-icon>settings</mat-icon>
            Parametres
          </button>
          <mat-menu #settingsMenu="matMenu">
            <a mat-menu-item routerLink="/admin/settings/notifications">
              <mat-icon>notifications_active</mat-icon>
              <span>Preferences de notification</span>
            </a>
            <button mat-menu-item (click)="deleteAllRead()">
              <mat-icon>delete_sweep</mat-icon>
              <span>Supprimer les notifications lues</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon info">
            <mat-icon>inbox</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalCount() }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon unread">
            <mat-icon>mark_email_unread</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ unreadCount() }}</span>
            <span class="stat-label">Non lues</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ warningCount() }}</span>
            <span class="stat-label">Alertes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon error">
            <mat-icon>error</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ errorCount() }}</span>
            <span class="stat-label">Erreurs</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <mat-card class="notifications-card">
        <mat-tab-group [(selectedIndex)]="selectedTab" (selectedIndexChange)="onTabChange($event)">
          <mat-tab label="Toutes">
            <ng-template matTabContent>
              <ng-container *ngTemplateOutlet="notificationsList"></ng-container>
            </ng-template>
          </mat-tab>
          <mat-tab>
            <ng-template mat-tab-label>
              Non lues
              <span class="tab-badge" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
            </ng-template>
            <ng-template matTabContent>
              <ng-container *ngTemplateOutlet="notificationsList"></ng-container>
            </ng-template>
          </mat-tab>
          <mat-tab label="Alertes">
            <ng-template matTabContent>
              <ng-container *ngTemplateOutlet="notificationsList"></ng-container>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <!-- Notifications List Template -->
      <ng-template #notificationsList>
        <div class="notifications-list" *ngIf="filteredNotifications().length > 0">
          <div class="notification-item"
               *ngFor="let notification of filteredNotifications()"
               [class.unread]="!notification.read"
               (click)="onNotificationClick(notification)">

            <div class="notification-checkbox">
              <mat-checkbox
                [checked]="selectedIds.has(notification.id)"
                (click)="$event.stopPropagation()"
                (change)="toggleSelection(notification.id)">
              </mat-checkbox>
            </div>

            <div class="notification-icon" [ngClass]="'level-' + notification.level.toLowerCase()">
              <mat-icon>{{ notification.icon || getLevelIcon(notification.level) }}</mat-icon>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-meta">
                <mat-chip class="level-chip" [ngClass]="'level-' + notification.level.toLowerCase()">
                  {{ notification.level }}
                </mat-chip>
                <a *ngIf="notification.actionUrl" [routerLink]="notification.actionUrl" class="notification-action">
                  {{ notification.actionLabel || 'Voir' }}
                  <mat-icon>chevron_right</mat-icon>
                </a>
              </div>
            </div>

            <div class="notification-actions">
              <button mat-icon-button
                      *ngIf="!notification.read"
                      (click)="markAsRead(notification, $event)"
                      matTooltip="Marquer comme lu">
                <mat-icon>done</mat-icon>
              </button>
              <button mat-icon-button
                      (click)="deleteNotification(notification, $event)"
                      matTooltip="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredNotifications().length === 0">
          <mat-icon>notifications_off</mat-icon>
          <h3>Aucune notification</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <!-- Pagination -->
        <mat-paginator *ngIf="totalCount() > pageSize"
                       [length]="totalCount()"
                       [pageSize]="pageSize"
                       [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </ng-template>

      <!-- Bulk Actions -->
      <div class="bulk-actions" *ngIf="selectedIds.size > 0">
        <span>{{ selectedIds.size }} notification(s) selectionnee(s)</span>
        <button mat-button (click)="bulkMarkAsRead()">
          <mat-icon>done_all</mat-icon>
          Marquer comme lu
        </button>
        <button mat-button color="warn" (click)="bulkDelete()">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
        <button mat-button (click)="clearSelection()">
          Annuler
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .subtitle {
        color: #64748b;
        margin: 4px 0 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.info {
        background: #dbeafe;
        color: #2563eb;
      }

      &.unread {
        background: #fef3c7;
        color: #d97706;
      }

      &.warning {
        background: #ffedd5;
        color: #ea580c;
      }

      &.error {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .stat-content {
      .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
      }

      .stat-label {
        font-size: 13px;
        color: #64748b;
      }
    }

    .notifications-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      ::ng-deep .mat-mdc-tab-body-content {
        padding: 0;
      }
    }

    .tab-badge {
      margin-left: 8px;
      padding: 2px 8px;
      background: #ef4444;
      color: white;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f8fafc;
      }

      &.unread {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%);
        border-left: 3px solid #6366f1;

        .notification-title {
          font-weight: 600;
        }
      }
    }

    .notification-checkbox {
      padding-top: 2px;
    }

    .notification-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.level-info {
        background: #dbeafe;
        color: #2563eb;
      }

      &.level-success {
        background: #dcfce7;
        color: #16a34a;
      }

      &.level-warning {
        background: #fef3c7;
        color: #d97706;
      }

      &.level-error {
        background: #fee2e2;
        color: #dc2626;
      }

      &.level-critical {
        background: #fce7f3;
        color: #db2777;
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }

    .notification-title {
      font-size: 15px;
      color: #0f172a;
    }

    .notification-time {
      font-size: 12px;
      color: #94a3b8;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .notification-message {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .level-chip {
      font-size: 11px;
      height: 24px;
      padding: 0 8px;

      &.level-info {
        background: #dbeafe !important;
        color: #2563eb !important;
      }

      &.level-success {
        background: #dcfce7 !important;
        color: #16a34a !important;
      }

      &.level-warning {
        background: #fef3c7 !important;
        color: #d97706 !important;
      }

      &.level-error {
        background: #fee2e2 !important;
        color: #dc2626 !important;
      }

      &.level-critical {
        background: #fce7f3 !important;
        color: #db2777 !important;
      }
    }

    .notification-action {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        text-decoration: underline;
      }
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;

      .notification-item:hover & {
        opacity: 1;
      }

      button {
        color: #64748b;

        &:hover {
          color: #0f172a;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      color: #94a3b8;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #64748b;
        margin: 0 0 8px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    mat-paginator {
      border-top: 1px solid #f1f5f9;
    }

    .bulk-actions {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;

      span {
        font-size: 14px;
        font-weight: 500;
      }

      button {
        color: white;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .notification-item {
        padding: 16px;
      }

      .notification-actions {
        opacity: 1;
      }

      .bulk-actions {
        left: 16px;
        right: 16px;
        transform: none;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  notifications = signal<Notification[]>([]);
  filteredNotifications = signal<Notification[]>([]);
  totalCount = signal(0);
  unreadCount = signal(0);
  warningCount = signal(0);
  errorCount = signal(0);

  selectedTab = 0;
  pageSize = 25;
  currentPage = 0;
  selectedIds = new Set<string>();

  ngOnInit() {
    this.notificationService.getNotificationsStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications.set(notifications);
        this.updateCounts(notifications);
        this.filterNotifications();
      });

    this.notificationService.getUnreadCountStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount.set(count));

    this.notificationService.getAll().subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCounts(notifications: Notification[]) {
    this.totalCount.set(notifications.length);
    this.warningCount.set(notifications.filter(n => n.level === NotificationLevel.WARNING).length);
    this.errorCount.set(notifications.filter(n =>
      n.level === NotificationLevel.ERROR || n.level === NotificationLevel.CRITICAL
    ).length);
  }

  filterNotifications() {
    let filtered = [...this.notifications()];

    switch (this.selectedTab) {
      case 1: // Unread
        filtered = filtered.filter(n => !n.read);
        break;
      case 2: // Alerts
        filtered = filtered.filter(n =>
          n.level === NotificationLevel.WARNING ||
          n.level === NotificationLevel.ERROR ||
          n.level === NotificationLevel.CRITICAL
        );
        break;
    }

    // Pagination
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.filteredNotifications.set(filtered.slice(start, end));
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    this.currentPage = 0;
    this.filterNotifications();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterNotifications();
  }

  onNotificationClick(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.dismiss(notification.id).subscribe();
  }

  deleteAllRead() {
    // Implementation would call backend to delete all read notifications
  }

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  bulkMarkAsRead() {
    // Bulk mark as read
    this.selectedIds.forEach(id => {
      this.notificationService.markAsRead(id).subscribe();
    });
    this.clearSelection();
  }

  bulkDelete() {
    // Bulk delete
    this.selectedIds.forEach(id => {
      this.notificationService.dismiss(id).subscribe();
    });
    this.clearSelection();
  }

  getLevelIcon(level: NotificationLevel): string {
    const icons: Record<NotificationLevel, string> = {
      [NotificationLevel.INFO]: 'info',
      [NotificationLevel.SUCCESS]: 'check_circle',
      [NotificationLevel.WARNING]: 'warning',
      [NotificationLevel.ERROR]: 'error',
      [NotificationLevel.CRITICAL]: 'dangerous'
    };
    return icons[level];
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return past.toLocaleDateString('fr-FR');
  }

  getEmptyMessage(): string {
    switch (this.selectedTab) {
      case 1: return 'Toutes vos notifications ont ete lues';
      case 2: return 'Aucune alerte pour le moment';
      default: return 'Vous n\'avez aucune notification';
    }
  }
}
