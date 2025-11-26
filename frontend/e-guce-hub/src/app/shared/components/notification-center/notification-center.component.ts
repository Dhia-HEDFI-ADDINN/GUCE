import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '@core/services/notification.service';
import {
  Notification,
  NotificationLevel,
  NotificationType
} from '@core/models/notification.model';

@Component({
  selector: 'hub-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatBadgeModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="notification-center">
      <button class="notification-trigger" [matMenuTriggerFor]="notificationMenu"
              matTooltip="Notifications">
        <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null"
                  matBadgeColor="warn"
                  matBadgeSize="small">
          notifications
        </mat-icon>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
        <div class="notification-panel" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="panel-header">
            <h3>Notifications</h3>
            <div class="header-actions">
              <button class="btn-text" *ngIf="unreadCount > 0" (click)="markAllAsRead()">
                Tout marquer lu
              </button>
              <a routerLink="/admin/settings/notifications" class="btn-icon" matTooltip="Parametres">
                <mat-icon>settings</mat-icon>
              </a>
            </div>
          </div>

          <!-- Filters -->
          <div class="panel-filters">
            <button [class.active]="filter === 'all'" (click)="setFilter('all')">Tout</button>
            <button [class.active]="filter === 'unread'" (click)="setFilter('unread')">
              Non lues
              <span class="count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>
          </div>

          <!-- Notifications List -->
          <div class="notifications-list" *ngIf="filteredNotifications.length > 0">
            <div class="notification-item" *ngFor="let notification of filteredNotifications"
                 [class.unread]="!notification.read"
                 [class]="'level-' + notification.level.toLowerCase()"
                 (click)="handleNotificationClick(notification)">
              <div class="notification-icon" [class]="'level-' + notification.level.toLowerCase()">
                <mat-icon>{{ notification.icon || getLevelIcon(notification.level) }}</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <span class="notification-title">{{ notification.title }}</span>
                  <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
                <a *ngIf="notification.actionUrl" [routerLink]="notification.actionUrl" class="notification-action">
                  {{ notification.actionLabel || 'Voir' }}
                  <mat-icon>arrow_forward</mat-icon>
                </a>
              </div>
              <button class="btn-dismiss" (click)="dismiss(notification, $event)" matTooltip="Supprimer">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredNotifications.length === 0">
            <mat-icon>notifications_none</mat-icon>
            <p>{{ filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification' }}</p>
          </div>

          <!-- Footer -->
          <div class="panel-footer">
            <a routerLink="/notifications" class="btn-text">
              Voir toutes les notifications
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notification-center {
      position: relative;
    }

    .notification-trigger {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      color: #616161;
      transition: all 0.2s;
    }
    .notification-trigger:hover {
      background: #f5f5f5;
      color: #1a237e;
    }

    ::ng-deep .notification-menu .mat-mdc-menu-content {
      padding: 0 !important;
    }

    .notification-panel {
      width: 400px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }
    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-text {
      background: none;
      border: none;
      color: #1a237e;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
    }
    .btn-text mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .btn-icon {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #757575;
      text-decoration: none;
    }
    .btn-icon:hover {
      background: #f5f5f5;
    }
    .btn-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .panel-filters {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
    }
    .panel-filters button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #f5f5f5;
      border: none;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .panel-filters button:hover {
      background: #e0e0e0;
    }
    .panel-filters button.active {
      background: #1a237e;
      color: white;
    }
    .panel-filters .count {
      background: #c62828;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
    }

    .notifications-list {
      flex: 1;
      overflow-y: auto;
      max-height: 350px;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }
    .notification-item:hover {
      background: #fafafa;
    }
    .notification-item.unread {
      background: #f3f4ff;
    }
    .notification-item.unread:hover {
      background: #e8eaf6;
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .notification-icon.level-info {
      background: #e3f2fd;
      color: #1565c0;
    }
    .notification-icon.level-success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .notification-icon.level-warning {
      background: #fff3e0;
      color: #f57c00;
    }
    .notification-icon.level-error {
      background: #ffebee;
      color: #c62828;
    }
    .notification-icon.level-critical {
      background: #fce4ec;
      color: #c2185b;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .notification-title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .notification-time {
      font-size: 11px;
      color: #9e9e9e;
      white-space: nowrap;
    }
    .notification-message {
      font-size: 12px;
      color: #616161;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notification-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #1a237e;
      text-decoration: none;
      margin-top: 6px;
    }
    .notification-action mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .btn-dismiss {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #bdbdbd;
      opacity: 0;
      transition: all 0.2s;
    }
    .notification-item:hover .btn-dismiss {
      opacity: 1;
    }
    .btn-dismiss:hover {
      background: #f5f5f5;
      color: #757575;
    }
    .btn-dismiss mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #9e9e9e;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .empty-state p {
      margin: 0;
      font-size: 13px;
    }

    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid #eee;
      text-align: center;
    }
    .panel-footer .btn-text {
      justify-content: center;
      font-size: 13px;
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  filter: 'all' | 'unread' = 'all';

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationService.getNotificationsStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilter();
      });

    // Subscribe to unread count
    this.notificationService.getUnreadCountStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount = count);

    // Initial load
    this.notificationService.getAll().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.read);
    } else {
      this.filteredNotifications = this.notifications;
    }
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  dismiss(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.dismiss(notification.id).subscribe();
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
}
