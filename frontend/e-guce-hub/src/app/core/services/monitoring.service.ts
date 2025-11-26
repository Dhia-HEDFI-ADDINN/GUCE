import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface HealthStatus {
  tenantId: string;
  tenantName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptime: number;
  lastCheck: Date;
  services: {
    name: string;
    status: 'UP' | 'DOWN' | 'DEGRADED';
    responseTime: number;
  }[];
}

export interface ResourceMetrics {
  tenantId: string;
  tenantName: string;
  cpu: { current: number; limit: number; percentage: number };
  memory: { current: number; limit: number; percentage: number };
  storage: { current: number; limit: number; percentage: number };
  network: { inbound: number; outbound: number };
}

export interface Alert {
  id: string;
  tenantId: string;
  tenantName: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface DashboardStats {
  totalTenants: number;
  healthyTenants: number;
  degradedTenants: number;
  unhealthyTenants: number;
  activeAlerts: number;
  totalTransactionsToday: number;
  totalActiveUsers: number;
  averageResponseTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/monitoring`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getHealthOverview(): Observable<HealthStatus[]> {
    return this.http.get<HealthStatus[]>(`${this.apiUrl}/health/overview`);
  }

  getHealthByTenant(tenantId: string): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.apiUrl}/health/${tenantId}`);
  }

  getResourcesOverview(): Observable<ResourceMetrics[]> {
    return this.http.get<ResourceMetrics[]>(`${this.apiUrl}/resources/overview`);
  }

  getResourcesByTenant(tenantId: string): Observable<ResourceMetrics> {
    return this.http.get<ResourceMetrics>(`${this.apiUrl}/resources/${tenantId}`);
  }

  getCpuMetrics(params?: { from?: Date; to?: Date }): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/cpu`, { params: params as any });
  }

  getMemoryMetrics(params?: { from?: Date; to?: Date }): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/memory`, { params: params as any });
  }

  getStorageMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/storage`);
  }

  getNetworkMetrics(params?: { from?: Date; to?: Date }): Observable<any> {
    return this.http.get(`${this.apiUrl}/resources/network`, { params: params as any });
  }

  getTransactionMetrics(params?: { period?: string }): Observable<any> {
    return this.http.get(`${this.apiUrl}/metrics/transactions`, { params: params as any });
  }

  getActiveUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metrics/users-active`);
  }

  getPerformanceMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metrics/performance`);
  }

  getActiveAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts/active`);
  }

  getAlertHistory(params?: { from?: Date; to?: Date; severity?: string }): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts/history`, { params: params as any });
  }

  acknowledgeAlert(alertId: string): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {});
  }

  resolveAlert(alertId: string): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/alerts/${alertId}/resolve`, {});
  }

  getAlertRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alerts/rules`);
  }

  createAlertRule(rule: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/alerts/rules`, rule);
  }

  updateAlertRule(ruleId: string, rule: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/alerts/rules/${ruleId}`, rule);
  }

  deleteAlertRule(ruleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alerts/rules/${ruleId}`);
  }

  generateReport(type: 'daily' | 'weekly' | 'custom', params?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reports/${type}`, params, { responseType: 'blob' });
  }
}
