import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval, Subject } from 'rxjs';
import { catchError, map, tap, takeUntil, switchMap, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Notification,
  NotificationLevel,
  NotificationType,
  NotificationChannel,
  NotificationPreferences,
  NotificationStats
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/api/v1/notifications`;

  // State
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private preferences$ = new BehaviorSubject<NotificationPreferences | null>(null);
  private destroy$ = new Subject<void>();

  private pollingEnabled = true;
  private pollingInterval = 30000;

  constructor() {
    this.startPolling();
  }

  // ============================================
  // Notifications CRUD
  // ============================================

  getAll(page = 0, size = 50): Observable<{ notifications: Notification[]; total: number }> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<{ notifications: Notification[]; total: number }>(this.apiUrl, { params }).pipe(
      tap(result => {
        this.notifications$.next(result.notifications);
        this.updateUnreadCount(result.notifications);
      }),
      catchError(() => {
        const mock = this.getMockNotifications();
        this.notifications$.next(mock);
        this.updateUnreadCount(mock);
        return of({ notifications: mock, total: mock.length });
      })
    );
  }

  create(notification: Partial<Notification>): Observable<Notification> {
    const newNotification: Partial<Notification> = {
      ...notification,
      read: false,
      dismissed: false,
      createdAt: new Date(),
      channels: notification.channels || [NotificationChannel.IN_APP]
    };

    return this.http.post<Notification>(this.apiUrl, newNotification).pipe(
      tap(created => this.addNotification(created)),
      catchError(() => {
        const mock = { ...newNotification, id: `local_${Date.now()}` } as Notification;
        this.addNotification(mock);
        return of(mock);
      })
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(updated => this.updateNotificationInList(updated)),
      catchError(() => {
        this.markReadLocally(id);
        return of({} as Notification);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notifications$.value.map(n => ({ ...n, read: true, readAt: new Date() }));
        this.notifications$.next(notifications);
        this.unreadCount$.next(0);
      }),
      catchError(() => {
        const notifications = this.notifications$.value.map(n => ({ ...n, read: true }));
        this.notifications$.next(notifications);
        this.unreadCount$.next(0);
        return of(void 0);
      })
    );
  }

  dismiss(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/dismiss`, {}).pipe(
      tap(() => this.removeNotificationFromList(id)),
      catchError(() => {
        this.removeNotificationFromList(id);
        return of(void 0);
      })
    );
  }

  // ============================================
  // Quick Notification Methods
  // ============================================

  notifyDeclarationStatus(
    declarationId: string,
    declarationRef: string,
    status: string,
    level = NotificationLevel.INFO
  ): Observable<Notification> {
    const statusLabels: Record<string, string> = {
      SUBMITTED: 'soumise',
      APPROVED: 'approuvee',
      REJECTED: 'rejetee',
      PENDING: 'en attente de traitement'
    };

    return this.create({
      type: NotificationType.DECLARATION_STATUS,
      level,
      title: `Declaration ${declarationRef}`,
      message: `Votre declaration a ete ${statusLabels[status] || status}`,
      declarationId,
      icon: status === 'APPROVED' ? 'check_circle' : status === 'REJECTED' ? 'cancel' : 'info',
      actionUrl: `/declarations/${declarationId}`,
      actionLabel: 'Voir la declaration'
    });
  }

  notifyTaskAssigned(taskId: string, taskTitle: string): Observable<Notification> {
    return this.create({
      type: NotificationType.TASK_ASSIGNED,
      level: NotificationLevel.INFO,
      title: 'Nouvelle tache assignee',
      message: taskTitle,
      icon: 'assignment',
      actionUrl: `/tasks/${taskId}`,
      actionLabel: 'Voir la tache'
    });
  }

  notifyPaymentDue(declarationId: string, amount: number, currency: string): Observable<Notification> {
    return this.create({
      type: NotificationType.PAYMENT_DUE,
      level: NotificationLevel.WARNING,
      title: 'Paiement en attente',
      message: `Un paiement de ${amount} ${currency} est en attente`,
      declarationId,
      icon: 'payment',
      actionUrl: `/payments?declaration=${declarationId}`,
      actionLabel: 'Payer maintenant'
    });
  }

  notifyDocumentReady(documentId: string, documentName: string): Observable<Notification> {
    return this.create({
      type: NotificationType.DOCUMENT_READY,
      level: NotificationLevel.SUCCESS,
      title: 'Document pret',
      message: `Le document "${documentName}" est disponible au telechargement`,
      icon: 'description',
      actionUrl: `/documents/${documentId}`,
      actionLabel: 'Telecharger'
    });
  }

  success(title: string, message: string): Observable<Notification> {
    return this.create({ type: NotificationType.SYSTEM_ALERT, level: NotificationLevel.SUCCESS, title, message, icon: 'check_circle' });
  }

  warning(title: string, message: string): Observable<Notification> {
    return this.create({ type: NotificationType.SYSTEM_ALERT, level: NotificationLevel.WARNING, title, message, icon: 'warning' });
  }

  error(title: string, message: string): Observable<Notification> {
    return this.create({ type: NotificationType.SYSTEM_ALERT, level: NotificationLevel.ERROR, title, message, icon: 'error' });
  }

  // ============================================
  // Streams
  // ============================================

  getNotificationsStream(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCountStream(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  getPreferencesStream(): Observable<NotificationPreferences | null> {
    return this.preferences$.asObservable();
  }

  // ============================================
  // Preferences
  // ============================================

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences`).pipe(
      tap(prefs => this.preferences$.next(prefs)),
      catchError(() => of(this.getDefaultPreferences()))
    );
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/preferences`, preferences).pipe(
      tap(updated => this.preferences$.next(updated))
    );
  }

  // ============================================
  // Polling
  // ============================================

  startPolling(): void {
    interval(this.pollingInterval).pipe(
      takeUntil(this.destroy$),
      filter(() => this.pollingEnabled),
      switchMap(() => this.checkNewNotifications())
    ).subscribe();
  }

  stopPolling(): void {
    this.pollingEnabled = false;
  }

  private checkNewNotifications(): Observable<Notification[]> {
    const lastNotification = this.notifications$.value[0];
    const since = lastNotification?.createdAt || new Date(Date.now() - 60000);

    return this.http.get<Notification[]>(`${this.apiUrl}/new`, {
      params: { since: new Date(since).toISOString() }
    }).pipe(
      tap(newNotifications => {
        if (newNotifications.length > 0) {
          const current = this.notifications$.value;
          this.notifications$.next([...newNotifications, ...current]);
          this.updateUnreadCount([...newNotifications, ...current]);
        }
      }),
      catchError(() => of([]))
    );
  }

  // ============================================
  // Private Helpers
  // ============================================

  private addNotification(notification: Notification): void {
    const current = this.notifications$.value;
    this.notifications$.next([notification, ...current]);
    this.updateUnreadCount([notification, ...current]);
  }

  private updateNotificationInList(notification: Notification): void {
    const notifications = this.notifications$.value;
    const index = notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      notifications[index] = notification;
      this.notifications$.next([...notifications]);
      this.updateUnreadCount(notifications);
    }
  }

  private markReadLocally(id: string): void {
    const notifications = this.notifications$.value;
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      notifications[index] = { ...notifications[index], read: true, readAt: new Date() };
      this.notifications$.next([...notifications]);
      this.updateUnreadCount(notifications);
    }
  }

  private removeNotificationFromList(id: string): void {
    const notifications = this.notifications$.value.filter(n => n.id !== id);
    this.notifications$.next(notifications);
    this.updateUnreadCount(notifications);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.read && !n.dismissed).length;
    this.unreadCount$.next(count);
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      userId: '',
      enabled: true,
      quietHoursEnabled: false,
      channels: {
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.PUSH]: true
      },
      minimumLevel: NotificationLevel.INFO,
      typePreferences: {} as any,
      digestEnabled: false
    };
  }

  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: NotificationType.DECLARATION_STATUS,
        level: NotificationLevel.SUCCESS,
        title: 'Declaration DEC-2024-001',
        message: 'Votre declaration a ete approuvee',
        declarationId: 'd1',
        read: false,
        dismissed: false,
        createdAt: new Date(),
        icon: 'check_circle',
        channels: [NotificationChannel.IN_APP]
      },
      {
        id: '2',
        type: NotificationType.PAYMENT_DUE,
        level: NotificationLevel.WARNING,
        title: 'Paiement en attente',
        message: 'Un paiement de 150,000 XAF est en attente',
        read: false,
        dismissed: false,
        createdAt: new Date(Date.now() - 3600000),
        icon: 'payment',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
      },
      {
        id: '3',
        type: NotificationType.TASK_ASSIGNED,
        level: NotificationLevel.INFO,
        title: 'Nouvelle tache',
        message: 'Verification des documents - DEC-2024-002',
        read: true,
        dismissed: false,
        createdAt: new Date(Date.now() - 86400000),
        icon: 'assignment',
        channels: [NotificationChannel.IN_APP]
      }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
