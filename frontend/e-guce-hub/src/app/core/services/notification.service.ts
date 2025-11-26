import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval, Subject } from 'rxjs';
import { catchError, map, tap, takeUntil, switchMap, filter } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  Notification,
  NotificationLevel,
  NotificationType,
  NotificationChannel,
  NotificationPreferences,
  NotificationTemplate,
  NotificationFilter,
  NotificationStats,
  NotificationGroup,
  NotificationEvent
} from '@core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/api/v1/notifications`;

  // State management
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private stats$ = new BehaviorSubject<NotificationStats | null>(null);
  private preferences$ = new BehaviorSubject<NotificationPreferences | null>(null);
  private notificationEvents$ = new Subject<NotificationEvent>();
  private destroy$ = new Subject<void>();

  // Polling interval (30 seconds)
  private pollingEnabled = true;
  private pollingInterval = 30000;

  constructor() {
    this.startPolling();
  }

  // ============================================
  // Notification Management
  // ============================================

  /**
   * Get all notifications
   */
  getAll(filter?: NotificationFilter, page = 0, size = 50): Observable<{ notifications: Notification[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter) {
      if (filter.types?.length) params = params.set('types', filter.types.join(','));
      if (filter.levels?.length) params = params.set('levels', filter.levels.join(','));
      if (filter.read !== undefined) params = params.set('read', filter.read.toString());
      if (filter.dismissed !== undefined) params = params.set('dismissed', filter.dismissed.toString());
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.tenantId) params = params.set('tenantId', filter.tenantId);
      if (filter.source) params = params.set('source', filter.source);
    }

    return this.http.get<{ notifications: Notification[]; total: number }>(this.apiUrl, { params }).pipe(
      tap(result => {
        this.notifications$.next(result.notifications);
        this.updateUnreadCount(result.notifications);
      }),
      catchError(() => {
        const mockData = this.getMockNotifications();
        this.notifications$.next(mockData);
        this.updateUnreadCount(mockData);
        return of({ notifications: mockData, total: mockData.length });
      })
    );
  }

  /**
   * Get notification by ID
   */
  getById(id: string): Observable<Notification | null> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Create a notification
   */
  create(notification: Partial<Notification>): Observable<Notification> {
    const newNotification: Partial<Notification> = {
      ...notification,
      read: false,
      dismissed: false,
      createdAt: new Date(),
      channels: notification.channels || [NotificationChannel.IN_APP]
    };

    return this.http.post<Notification>(this.apiUrl, newNotification).pipe(
      tap(created => {
        this.addNotification(created);
        this.notificationEvents$.next({ action: 'NEW', notification: created, timestamp: new Date() });
      }),
      catchError(() => {
        const mock = { ...newNotification, id: `local_${Date.now()}` } as Notification;
        this.addNotification(mock);
        return of(mock);
      })
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(updated => {
        this.updateNotification(updated);
        this.notificationEvents$.next({ action: 'READ', notification: updated, timestamp: new Date() });
      }),
      catchError(() => {
        const notifications = this.notifications$.value;
        const index = notifications.findIndex(n => n.id === id);
        if (index >= 0) {
          notifications[index] = { ...notifications[index], read: true, readAt: new Date() };
          this.notifications$.next([...notifications]);
          this.updateUnreadCount(notifications);
        }
        return of(notifications[index]);
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notifications$.value.map(n => ({ ...n, read: true, readAt: new Date() }));
        this.notifications$.next(notifications);
        this.unreadCount$.next(0);
      }),
      catchError(() => {
        const notifications = this.notifications$.value.map(n => ({ ...n, read: true, readAt: new Date() }));
        this.notifications$.next(notifications);
        this.unreadCount$.next(0);
        return of(void 0);
      })
    );
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/dismiss`, {}).pipe(
      tap(() => {
        const notifications = this.notifications$.value.filter(n => n.id !== id);
        this.notifications$.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(() => {
        const notifications = this.notifications$.value.filter(n => n.id !== id);
        this.notifications$.next(notifications);
        this.updateUnreadCount(notifications);
        return of(void 0);
      })
    );
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/dismiss-all`, {}).pipe(
      tap(() => {
        this.notifications$.next([]);
        this.unreadCount$.next(0);
      }),
      catchError(() => {
        this.notifications$.next([]);
        this.unreadCount$.next(0);
        return of(void 0);
      })
    );
  }

  /**
   * Delete notification
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const notifications = this.notifications$.value.filter(n => n.id !== id);
        this.notifications$.next(notifications);
        this.updateUnreadCount(notifications);
      })
    );
  }

  // ============================================
  // Quick Notification Methods
  // ============================================

  /**
   * Send system notification
   */
  notifySystem(title: string, message: string, level = NotificationLevel.INFO): Observable<Notification> {
    return this.create({
      type: NotificationType.SYSTEM_ALERT,
      level,
      title,
      message,
      source: 'SYSTEM',
      icon: this.getIconForLevel(level)
    });
  }

  /**
   * Notify tenant status change
   */
  notifyTenantStatus(
    tenantId: string,
    tenantCode: string,
    status: string,
    level = NotificationLevel.INFO
  ): Observable<Notification> {
    const statusLabels: Record<string, string> = {
      RUNNING: 'est maintenant en cours d\'execution',
      STOPPED: 'a ete arrete',
      ERROR: 'est en erreur',
      MAINTENANCE: 'est en maintenance',
      DEPLOYING: 'est en cours de deploiement'
    };

    return this.create({
      type: NotificationType.TENANT_STATUS,
      level,
      title: `Instance ${tenantCode}`,
      message: `L'instance ${tenantCode} ${statusLabels[status] || status}`,
      tenantId,
      source: 'TENANT_MANAGER',
      icon: 'apartment',
      actionUrl: `/tenants/${tenantId}/overview`,
      actionLabel: 'Voir l\'instance'
    });
  }

  /**
   * Notify deployment progress
   */
  notifyDeployment(
    tenantId: string,
    tenantCode: string,
    progress: number,
    step: string
  ): Observable<Notification> {
    const level = progress === 100 ? NotificationLevel.SUCCESS : NotificationLevel.INFO;
    return this.create({
      type: NotificationType.TENANT_DEPLOYMENT,
      level,
      title: `Deploiement ${tenantCode}`,
      message: progress === 100 ? `Deploiement termine avec succes` : `${step} (${progress}%)`,
      tenantId,
      source: 'DEPLOYMENT_SERVICE',
      icon: 'rocket_launch',
      data: { progress, step }
    });
  }

  /**
   * Notify security event
   */
  notifySecurity(
    title: string,
    message: string,
    level = NotificationLevel.WARNING,
    data?: Record<string, any>
  ): Observable<Notification> {
    return this.create({
      type: NotificationType.SECURITY_ALERT,
      level,
      title,
      message,
      source: 'SECURITY',
      icon: 'security',
      data
    });
  }

  /**
   * Notify performance alert
   */
  notifyPerformance(
    tenantId: string,
    tenantCode: string,
    metric: string,
    value: number,
    threshold: number
  ): Observable<Notification> {
    return this.create({
      type: NotificationType.PERFORMANCE_ALERT,
      level: NotificationLevel.WARNING,
      title: `Alerte Performance - ${tenantCode}`,
      message: `${metric}: ${value} depasse le seuil de ${threshold}`,
      tenantId,
      source: 'MONITORING',
      icon: 'speed',
      data: { metric, value, threshold }
    });
  }

  /**
   * Success notification
   */
  success(title: string, message: string): Observable<Notification> {
    return this.notifySystem(title, message, NotificationLevel.SUCCESS);
  }

  /**
   * Warning notification
   */
  warning(title: string, message: string): Observable<Notification> {
    return this.notifySystem(title, message, NotificationLevel.WARNING);
  }

  /**
   * Error notification
   */
  error(title: string, message: string): Observable<Notification> {
    return this.notifySystem(title, message, NotificationLevel.ERROR);
  }

  /**
   * Critical notification
   */
  critical(title: string, message: string): Observable<Notification> {
    return this.notifySystem(title, message, NotificationLevel.CRITICAL);
  }

  // ============================================
  // Streams
  // ============================================

  /**
   * Get notifications stream
   */
  getNotificationsStream(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Get unread count stream
   */
  getUnreadCountStream(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Get stats stream
   */
  getStatsStream(): Observable<NotificationStats | null> {
    return this.stats$.asObservable();
  }

  /**
   * Get notification events stream
   */
  getEventsStream(): Observable<NotificationEvent> {
    return this.notificationEvents$.asObservable();
  }

  /**
   * Get notifications grouped by date
   */
  getGroupedNotifications(): Observable<NotificationGroup[]> {
    return this.notifications$.pipe(
      map(notifications => this.groupByDate(notifications))
    );
  }

  // ============================================
  // Preferences
  // ============================================

  /**
   * Get user preferences
   */
  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences`).pipe(
      tap(prefs => this.preferences$.next(prefs)),
      catchError(() => of(this.getDefaultPreferences()))
    );
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/preferences`, preferences).pipe(
      tap(updated => this.preferences$.next(updated))
    );
  }

  /**
   * Get preferences stream
   */
  getPreferencesStream(): Observable<NotificationPreferences | null> {
    return this.preferences$.asObservable();
  }

  // ============================================
  // Templates
  // ============================================

  /**
   * Get notification templates
   */
  getTemplates(): Observable<NotificationTemplate[]> {
    return this.http.get<NotificationTemplate[]>(`${this.apiUrl}/templates`);
  }

  /**
   * Create/Update template
   */
  saveTemplate(template: Partial<NotificationTemplate>): Observable<NotificationTemplate> {
    if (template.id) {
      return this.http.put<NotificationTemplate>(`${this.apiUrl}/templates/${template.id}`, template);
    }
    return this.http.post<NotificationTemplate>(`${this.apiUrl}/templates`, template);
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get notification statistics
   */
  getStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => this.stats$.next(stats)),
      catchError(() => of(this.getMockStats()))
    );
  }

  // ============================================
  // Polling
  // ============================================

  /**
   * Start polling for new notifications
   */
  startPolling(): void {
    if (!this.pollingEnabled) return;

    interval(this.pollingInterval).pipe(
      takeUntil(this.destroy$),
      filter(() => this.pollingEnabled),
      switchMap(() => this.checkNewNotifications())
    ).subscribe();
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    this.pollingEnabled = false;
  }

  /**
   * Resume polling
   */
  resumePolling(): void {
    this.pollingEnabled = true;
  }

  /**
   * Set polling interval
   */
  setPollingInterval(ms: number): void {
    this.pollingInterval = ms;
  }

  /**
   * Check for new notifications
   */
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
          newNotifications.forEach(n => {
            this.notificationEvents$.next({ action: 'NEW', notification: n, timestamp: new Date() });
          });
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

  private updateNotification(notification: Notification): void {
    const notifications = this.notifications$.value;
    const index = notifications.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      notifications[index] = notification;
      this.notifications$.next([...notifications]);
      this.updateUnreadCount(notifications);
    }
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.read && !n.dismissed).length;
    this.unreadCount$.next(count);
  }

  private groupByDate(notifications: Notification[]): NotificationGroup[] {
    const groups = new Map<string, Notification[]>();

    notifications.forEach(n => {
      const date = new Date(n.createdAt).toLocaleDateString('fr-FR');
      const existing = groups.get(date) || [];
      groups.set(date, [...existing, n]);
    });

    return Array.from(groups.entries()).map(([date, notifications]) => ({
      date,
      notifications
    }));
  }

  private getIconForLevel(level: NotificationLevel): string {
    const icons: Record<NotificationLevel, string> = {
      [NotificationLevel.INFO]: 'info',
      [NotificationLevel.SUCCESS]: 'check_circle',
      [NotificationLevel.WARNING]: 'warning',
      [NotificationLevel.ERROR]: 'error',
      [NotificationLevel.CRITICAL]: 'dangerous'
    };
    return icons[level];
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
        [NotificationChannel.PUSH]: true,
        [NotificationChannel.WEBHOOK]: false
      },
      minimumLevel: NotificationLevel.INFO,
      typePreferences: {},
      digestEnabled: false
    };
  }

  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: NotificationType.TENANT_STATUS,
        level: NotificationLevel.SUCCESS,
        title: 'Instance GUCE-CM',
        message: 'L\'instance GUCE-CM est maintenant en cours d\'execution',
        read: false,
        dismissed: false,
        createdAt: new Date(),
        source: 'TENANT_MANAGER',
        icon: 'apartment',
        channels: [NotificationChannel.IN_APP]
      },
      {
        id: '2',
        type: NotificationType.SECURITY_ALERT,
        level: NotificationLevel.WARNING,
        title: 'Tentative de connexion',
        message: '3 tentatives de connexion echouees pour admin@guce.cm',
        read: false,
        dismissed: false,
        createdAt: new Date(Date.now() - 3600000),
        source: 'SECURITY',
        icon: 'security',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
      },
      {
        id: '3',
        type: NotificationType.SYSTEM_UPDATE,
        level: NotificationLevel.INFO,
        title: 'Mise a jour disponible',
        message: 'Une nouvelle version de la plateforme est disponible (v3.2.0)',
        read: true,
        dismissed: false,
        createdAt: new Date(Date.now() - 86400000),
        source: 'SYSTEM',
        icon: 'system_update',
        channels: [NotificationChannel.IN_APP]
      }
    ];
  }

  private getMockStats(): NotificationStats {
    return {
      total: 0,
      unread: 0,
      byLevel: {
        [NotificationLevel.INFO]: 0,
        [NotificationLevel.SUCCESS]: 0,
        [NotificationLevel.WARNING]: 0,
        [NotificationLevel.ERROR]: 0,
        [NotificationLevel.CRITICAL]: 0
      },
      byType: {},
      recentCount: 0
    };
  }

  /**
   * Cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
