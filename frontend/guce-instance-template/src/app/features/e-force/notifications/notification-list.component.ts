import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'guce-notification-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="notification-list-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <button mat-stroked-button (click)="markAllAsRead()">
          <mat-icon>done_all</mat-icon>
          Tout marquer comme lu
        </button>
      </div>

      <div class="notification-list">
        <mat-card class="notification-item" *ngFor="let notif of notifications" [class.unread]="!notif.read" (click)="openNotification(notif)">
          <div class="notif-icon" [class]="notif.type">
            <mat-icon>{{ getIcon(notif.type) }}</mat-icon>
          </div>
          <div class="notif-content">
            <h3>{{ notif.title }}</h3>
            <p>{{ notif.message }}</p>
            <span class="notif-time">{{ notif.time }}</span>
          </div>
          <div class="notif-actions">
            <button mat-icon-button (click)="markAsRead(notif, $event)" *ngIf="!notif.read">
              <mat-icon>check</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteNotif(notif, $event)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </mat-card>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <mat-icon>notifications_none</mat-icon>
          <p>Aucune notification</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-list-container { padding: 24px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 24px; }
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover { background: #fafafa; }
      &.unread { border-left: 4px solid #1976d2; background: #f5f9ff; }

      .notif-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.success { background: #e8f5e9; color: #388e3c; }
        &.warning { background: #fff3e0; color: #f57c00; }
        &.error { background: #ffebee; color: #c62828; }
        &.info { background: #e3f2fd; color: #1976d2; }
      }

      .notif-content {
        flex: 1;

        h3 { margin: 0 0 4px; font-size: 15px; font-weight: 500; }
        p { margin: 0 0 8px; color: #616161; font-size: 14px; }
        .notif-time { font-size: 12px; color: #9e9e9e; }
      }
    }

    .empty-state {
      text-align: center;
      padding: 64px;
      color: #9e9e9e;

      mat-icon { font-size: 64px; width: 64px; height: 64px; }
      p { margin: 16px 0 0; }
    }
  `]
})
export class NotificationListComponent implements OnInit {
  notifications = [
    { id: '1', type: 'success', title: 'Déclaration approuvée', message: 'Votre déclaration IMP-2024-001233 a été approuvée par les Douanes.', time: 'Il y a 5 min', read: false },
    { id: '2', type: 'warning', title: 'Document manquant', message: 'Le certificat d\'origine est requis pour EXP-2024-005678.', time: 'Il y a 30 min', read: false },
    { id: '3', type: 'info', title: 'Nouveau message', message: 'L\'agent des Douanes a commenté votre dossier IMP-2024-001234.', time: 'Il y a 1h', read: true },
    { id: '4', type: 'error', title: 'Paiement échoué', message: 'Le paiement pour la déclaration TRANS-2024-000123 a échoué.', time: 'Il y a 2h', read: true }
  ];

  ngOnInit() {}

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      info: 'info'
    };
    return icons[type] || 'notifications';
  }

  openNotification(notif: any) {
    notif.read = true;
    console.log('Open notification', notif);
  }

  markAsRead(notif: any, event: Event) {
    event.stopPropagation();
    notif.read = true;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  deleteNotif(notif: any, event: Event) {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== notif.id);
  }
}
