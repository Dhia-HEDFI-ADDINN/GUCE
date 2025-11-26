import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '@env/environment';

/**
 * Service de connexion au Hub E-GUCE 3G.
 *
 * Ce service gere:
 * - La communication entre l'instance GUCE et le Hub central
 * - L'envoi des metriques et statuts
 * - La reception des mises a jour et configurations
 * - La synchronisation des templates et referentiels
 */
@Injectable({
  providedIn: 'root'
})
export class HubConnectionService {
  private http = inject(HttpClient);

  private hubUrl = environment.hubUrl || 'http://localhost:8080';
  private tenantCode = environment.tenantCode || 'DEFAULT';
  private hubApiKey = environment.hubApiKey || '';

  private connectionStatus$ = new BehaviorSubject<HubConnectionStatus>({
    connected: false,
    lastSync: null,
    hubVersion: null
  });

  private syncInterval = 60000; // 1 minute

  /**
   * Obtient le statut de connexion au Hub.
   */
  getConnectionStatus(): Observable<HubConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Initialise la connexion au Hub.
   */
  initializeConnection(): Observable<boolean> {
    return this.checkHubConnection().pipe(
      tap(connected => {
        if (connected) {
          this.startHeartbeat();
          this.startMetricsSync();
        }
      })
    );
  }

  /**
   * Verifie la connexion au Hub.
   */
  checkHubConnection(): Observable<boolean> {
    return this.http.get<HubHealthResponse>(`${this.hubUrl}/api/v1/health`, {
      headers: this.getHubHeaders()
    }).pipe(
      map(response => {
        this.connectionStatus$.next({
          connected: true,
          lastSync: new Date(),
          hubVersion: response.version
        });
        return true;
      }),
      catchError(error => {
        console.warn('Hub connection failed:', error.message);
        this.connectionStatus$.next({
          connected: false,
          lastSync: this.connectionStatus$.value.lastSync,
          hubVersion: null,
          error: error.message
        });
        return of(false);
      })
    );
  }

  /**
   * Envoie le statut de l'instance au Hub.
   */
  sendInstanceStatus(status: InstanceStatus): Observable<void> {
    return this.http.post<void>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/status`,
      status,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Failed to send instance status:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Envoie les metriques de l'instance au Hub.
   */
  sendMetrics(metrics: InstanceMetrics): Observable<void> {
    return this.http.post<void>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/metrics`,
      metrics,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Failed to send metrics:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Recupere les mises a jour de configuration depuis le Hub.
   */
  fetchConfigurationUpdates(): Observable<ConfigurationUpdate | null> {
    return this.http.get<ConfigurationUpdate>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/config/updates`,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Failed to fetch config updates:', error);
        return of(null);
      })
    );
  }

  /**
   * Synchronise les templates de procedures depuis le Hub.
   */
  syncProcedureTemplates(): Observable<ProcedureTemplate[]> {
    return this.http.get<ProcedureTemplate[]>(
      `${this.hubUrl}/api/v1/templates/procedures`,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Failed to sync procedure templates:', error);
        return of([]);
      })
    );
  }

  /**
   * Synchronise les referentiels depuis le Hub.
   */
  syncReferentials(): Observable<ReferentialSync> {
    return this.http.get<ReferentialSync>(
      `${this.hubUrl}/api/v1/referentials/sync`,
      {
        headers: this.getHubHeaders(),
        params: { tenantCode: this.tenantCode }
      }
    ).pipe(
      catchError(error => {
        console.error('Failed to sync referentials:', error);
        return of({ countries: [], currencies: [], hsCode: [], lastUpdated: null });
      })
    );
  }

  /**
   * Enregistre un evenement aupres du Hub (audit central).
   */
  logEvent(event: HubEvent): Observable<void> {
    return this.http.post<void>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/events`,
      event,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Failed to log event to hub:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Demande une mise a jour de l'instance.
   */
  requestUpdate(updateRequest: UpdateRequest): Observable<UpdateResponse> {
    return this.http.post<UpdateResponse>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/update-request`,
      updateRequest,
      { headers: this.getHubHeaders() }
    );
  }

  /**
   * Obtient les informations de licence de l'instance.
   */
  getLicenseInfo(): Observable<LicenseInfo> {
    return this.http.get<LicenseInfo>(
      `${this.hubUrl}/api/v1/instances/${this.tenantCode}/license`,
      { headers: this.getHubHeaders() }
    ).pipe(
      catchError(() => of({
        valid: true,
        expiresAt: null,
        modules: [],
        maxUsers: -1
      }))
    );
  }

  // --- Private Methods ---

  private getHubHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Code': this.tenantCode,
      'X-Hub-Api-Key': this.hubApiKey
    });
  }

  private startHeartbeat(): void {
    interval(this.syncInterval).pipe(
      switchMap(() => this.checkHubConnection())
    ).subscribe();
  }

  private startMetricsSync(): void {
    interval(this.syncInterval * 5).pipe( // Every 5 minutes
      switchMap(() => this.collectAndSendMetrics())
    ).subscribe();
  }

  private collectAndSendMetrics(): Observable<void> {
    const metrics: InstanceMetrics = {
      timestamp: new Date().toISOString(),
      activeUsers: this.getActiveUsersCount(),
      transactionsToday: this.getTransactionsCount(),
      avgResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: 0 // Would need server-side reporting
    };
    return this.sendMetrics(metrics);
  }

  // Mock implementations - in production, these would get real data
  private getActiveUsersCount(): number {
    return Math.floor(Math.random() * 100) + 10;
  }

  private getTransactionsCount(): number {
    return Math.floor(Math.random() * 1000) + 100;
  }

  private getAverageResponseTime(): number {
    return Math.floor(Math.random() * 200) + 50;
  }

  private getErrorRate(): number {
    return Math.random() * 2;
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }
}

// --- Interfaces ---

export interface HubConnectionStatus {
  connected: boolean;
  lastSync: Date | null;
  hubVersion: string | null;
  error?: string;
}

export interface HubHealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface InstanceStatus {
  status: 'RUNNING' | 'MAINTENANCE' | 'ERROR';
  version: string;
  uptime: number;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime?: number;
}

export interface InstanceMetrics {
  timestamp: string;
  activeUsers: number;
  transactionsToday: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ConfigurationUpdate {
  hasUpdates: boolean;
  modules?: ModuleConfig[];
  features?: FeatureFlag[];
  referentials?: string[];
}

export interface ModuleConfig {
  name: string;
  enabled: boolean;
  version?: string;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
}

export interface ProcedureTemplate {
  id: string;
  code: string;
  name: string;
  version: number;
  category: string;
  lastUpdated: string;
}

export interface ReferentialSync {
  countries: any[];
  currencies: any[];
  hsCode: any[];
  lastUpdated: string | null;
}

export interface HubEvent {
  type: string;
  action: string;
  userId?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface UpdateRequest {
  type: 'MODULES' | 'CONFIG' | 'VERSION';
  details: Record<string, any>;
}

export interface UpdateResponse {
  requestId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  estimatedTime?: string;
}

export interface LicenseInfo {
  valid: boolean;
  expiresAt: string | null;
  modules: string[];
  maxUsers: number;
}
