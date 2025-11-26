import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Tenant, TenantCreateRequest, TenantMetrics } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tenants`;

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`);
  }

  create(request: TenantCreateRequest): Observable<Tenant> {
    return this.http.post<Tenant>(this.apiUrl, request);
  }

  update(id: string, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}`, tenant);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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

  getMetrics(id: string): Observable<TenantMetrics> {
    return this.http.get<TenantMetrics>(`${this.apiUrl}/${id}/metrics`);
  }

  getLogs(id: string, params?: { level?: string; from?: Date; to?: Date }): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/logs`, { params: params as any });
  }

  deploy(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/deploy`, {});
  }

  updateModules(id: string, modules: any): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}/modules`, modules);
  }

  compare(tenantIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare`, { tenantIds });
  }
}
