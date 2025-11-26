import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, switchMap, tap, takeWhile } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  Tenant,
  TenantCreateRequest,
  TenantMetrics,
  TenantStatus,
  DeploymentStatus,
  HubStats
} from '../models/tenant.model';

/**
 * Service de gestion des tenants/instances GUCE.
 * Communique avec le microservice ms-tenant.
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/api/v1/tenants`;

  // Observable pour le suivi du deploiement en cours
  private deploymentProgress$ = new BehaviorSubject<DeploymentStatus | null>(null);

  // ===== CRUD Operations =====

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  getActive(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/active`);
  }

  getByStatus(status: TenantStatus): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/status/${status}`);
  }

  search(query: string, page = 0, size = 20): Observable<{ content: Tenant[]; totalElements: number }> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`);
  }

  getByCode(code: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/code/${code}`);
  }

  create(request: TenantCreateRequest): Observable<Tenant> {
    const apiRequest = this.transformCreateRequest(request);
    return this.http.post<Tenant>(this.apiUrl, apiRequest);
  }

  update(id: string, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}`, tenant);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ===== Lifecycle Operations =====

  deploy(id: string, options?: { skipHealthCheck?: boolean; forceDeploy?: boolean }): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/${id}/deploy`, options || {}).pipe(
      tap(tenant => {
        this.startDeploymentTracking(id);
      })
    );
  }

  start(id: string): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/${id}/start`, {});
  }

  stop(id: string): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/${id}/stop`, {});
  }

  restart(id: string): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/${id}/restart`, {});
  }

  setMaintenance(id: string, enabled: boolean): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/${id}/maintenance`, null, {
      params: { enabled: enabled.toString() }
    });
  }

  // ===== Module Management =====

  updateModules(id: string, modules: any): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}/modules`, modules);
  }

  // ===== Metrics & Stats =====

  getMetrics(id: string): Observable<TenantMetrics> {
    return this.http.get<TenantMetrics>(`${this.apiUrl}/${id}/metrics`);
  }

  getLogs(id: string, params?: { level?: string; from?: Date; to?: Date }): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/logs`, { params: params as any });
  }

  getHubStats(): Observable<HubStats> {
    return this.http.get<HubStats>(`${this.apiUrl}/stats`);
  }

  compare(tenantIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare`, tenantIds);
  }

  // ===== Deployment Tracking =====

  getDeploymentProgress(): Observable<DeploymentStatus | null> {
    return this.deploymentProgress$.asObservable();
  }

  private startDeploymentTracking(tenantId: string): void {
    const steps: DeploymentStatus['steps'] = [
      { id: 'database', label: 'Creation base de donnees', status: 'pending' },
      { id: 'keycloak', label: 'Configuration Keycloak', status: 'pending' },
      { id: 'users', label: 'Creation utilisateurs', status: 'pending' },
      { id: 'services', label: 'Deploiement services', status: 'pending' },
      { id: 'routing', label: 'Configuration routage', status: 'pending' }
    ];

    this.deploymentProgress$.next({
      tenantId,
      status: 'PROVISIONING',
      progress: 0,
      currentStep: 'database',
      steps,
      startedAt: new Date()
    });

    this.pollDeploymentStatus(tenantId);
  }

  private pollDeploymentStatus(tenantId: string): void {
    let isActive = true;

    interval(3000).pipe(
      takeWhile(() => isActive),
      switchMap(() => this.getById(tenantId)),
      tap(tenant => {
        const current = this.deploymentProgress$.value;
        if (!current) {
          isActive = false;
          return;
        }

        if (tenant.status === TenantStatus.RUNNING) {
          this.deploymentProgress$.next({
            ...current,
            status: 'COMPLETED',
            progress: 100,
            steps: current.steps.map(s => ({ ...s, status: 'completed' as const })),
            completedAt: new Date()
          });
          isActive = false;
        } else if (tenant.status === TenantStatus.ERROR) {
          this.deploymentProgress$.next({
            ...current,
            status: 'FAILED',
            error: 'Le deploiement a echoue'
          });
          isActive = false;
        } else if (tenant.status === TenantStatus.PROVISIONING) {
          const progress = Math.min(current.progress + 15, 90);
          const stepIndex = Math.floor(progress / 20);
          const steps = current.steps.map((s, i) => ({
            ...s,
            status: i < stepIndex ? 'completed' as const : i === stepIndex ? 'running' as const : 'pending' as const
          }));

          this.deploymentProgress$.next({
            ...current,
            progress,
            currentStep: steps[stepIndex]?.id || current.currentStep,
            steps
          });
        }
      }),
      catchError(() => {
        isActive = false;
        return of(null);
      })
    ).subscribe();
  }

  clearDeploymentProgress(): void {
    this.deploymentProgress$.next(null);
  }

  // ===== Helper Methods =====

  private transformCreateRequest(wizardRequest: any): any {
    return {
      code: wizardRequest.tenant?.code?.toUpperCase(),
      name: wizardRequest.tenant?.name,
      shortName: wizardRequest.tenant?.shortName,
      domain: wizardRequest.tenant?.domain,
      country: wizardRequest.tenant?.code?.toUpperCase(),
      primaryColor: wizardRequest.tenant?.primaryColor,
      secondaryColor: wizardRequest.tenant?.secondaryColor,
      timezone: wizardRequest.tenant?.timezone,
      locale: `fr-${wizardRequest.tenant?.code?.toUpperCase()}`,
      currency: wizardRequest.tenant?.currency,

      technical: {
        environment: wizardRequest.technical?.environment?.toUpperCase(),
        highAvailability: wizardRequest.technical?.highAvailability,
        autoScaling: wizardRequest.technical?.autoScaling?.enabled,
        minReplicas: wizardRequest.technical?.autoScaling?.minReplicas,
        maxReplicas: wizardRequest.technical?.autoScaling?.maxReplicas,
        backupEnabled: wizardRequest.technical?.backup?.enabled,
        backupFrequency: wizardRequest.technical?.backup?.frequency?.toUpperCase(),
        backupRetentionDays: wizardRequest.technical?.backup?.retention
      },

      modules: {
        eForce: { enabled: wizardRequest.modules?.eForce?.enabled || false },
        eGov: { enabled: wizardRequest.modules?.eGov?.enabled || false },
        eBusiness: { enabled: wizardRequest.modules?.eBusiness?.enabled || false },
        ePayment: { enabled: wizardRequest.modules?.ePayment?.enabled || false },
        procedureBuilder: { enabled: wizardRequest.modules?.procedureBuilder?.enabled || false },
        admin: { enabled: wizardRequest.modules?.admin?.enabled || false }
      },

      initialAdmins: wizardRequest.initialAdmins?.map((admin: any) => ({
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: this.mapAdminRole(admin.role)
      })),

      infrastructure: {
        provider: wizardRequest.infrastructure?.provider?.toUpperCase(),
        region: wizardRequest.infrastructure?.region,
        kubernetesVersion: wizardRequest.infrastructure?.kubernetesVersion,
        machineType: wizardRequest.infrastructure?.machineType,
        nodeCount: wizardRequest.infrastructure?.nodeCount,
        databaseType: wizardRequest.infrastructure?.databaseType?.toUpperCase(),
        databaseSize: wizardRequest.infrastructure?.databaseSize,
        storageSizeGb: parseInt(wizardRequest.infrastructure?.storageSize?.replace(/\D/g, '')) || 100
      }
    };
  }

  private mapAdminRole(role: string): string {
    const roleMap: Record<string, string> = {
      'SUPER_ADMIN_INSTANCE': 'SUPER_ADMIN',
      'ADMIN_FONCTIONNEL': 'FUNCTIONAL_ADMIN',
      'ADMIN_TECHNIQUE': 'TECHNICAL_ADMIN'
    };
    return roleMap[role] || role;
  }
}
