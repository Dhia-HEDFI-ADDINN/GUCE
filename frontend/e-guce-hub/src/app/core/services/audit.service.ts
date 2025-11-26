import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Audit log entry
export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  category: AuditCategory;
  userId: string;
  userName: string;
  userEmail: string;
  tenantId?: string;
  tenantName?: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  description: string;
  changes?: FieldChange[];
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  CANCEL = 'CANCEL'
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  TENANT_MANAGEMENT = 'TENANT_MANAGEMENT',
  BILLING = 'BILLING',
  CONFIGURATION = 'CONFIGURATION',
  GENERATOR = 'GENERATOR',
  MONITORING = 'MONITORING',
  SECURITY = 'SECURITY'
}

export interface LoginLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  status: 'SUCCESS' | 'FAILED' | 'SUSPICIOUS';
  failureReason?: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  device: {
    type: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
    os: string;
    browser: string;
  };
  sessionId?: string;
  mfaUsed: boolean;
  riskScore?: number;
}

export interface AuditSearchParams extends QueryParams {
  action?: AuditAction;
  category?: AuditCategory;
  userId?: string;
  tenantId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  status?: 'SUCCESS' | 'FAILURE';
  search?: string;
}

export interface LoginSearchParams extends QueryParams {
  userId?: string;
  status?: 'SUCCESS' | 'FAILED' | 'SUSPICIOUS';
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService extends BaseService<AuditLog> {
  constructor() {
    super(inject(HttpClient), environment.services.audit);
  }

  /**
   * Search audit logs with filters
   */
  searchLogs(params: AuditSearchParams): Observable<PagedResponse<AuditLog>> {
    return this.getAll(params);
  }

  /**
   * Get audit log detail
   */
  getLogDetail(logId: string): Observable<AuditLog> {
    return this.getById(logId);
  }

  /**
   * Get audit logs for a specific user
   */
  getUserLogs(userId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/users/${userId}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for a specific tenant
   */
  getTenantLogs(tenantId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/tenants/${tenantId}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for a specific resource
   */
  getResourceLogs(resourceType: string, resourceId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/resources/${resourceType}/${resourceId}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Login Logs
  // ============================================

  /**
   * Search login logs
   */
  searchLogins(params: LoginSearchParams): Observable<PagedResponse<LoginLog>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<LoginLog>>>(`${this.baseUrl}/logins`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get login statistics
   */
  getLoginStats(period: { start: string; end: string }): Observable<{
    total: number;
    successful: number;
    failed: number;
    suspicious: number;
    uniqueUsers: number;
    byHour: { hour: string; count: number }[];
    byCountry: { country: string; count: number }[];
    topFailedIps: { ip: string; count: number }[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/logins/stats`, {
      params: { startDate: period.start, endDate: period.end }
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get suspicious login attempts
   */
  getSuspiciousLogins(params?: QueryParams): Observable<PagedResponse<LoginLog>> {
    const httpParams = this.buildParams({ ...params, status: 'SUSPICIOUS' });
    return this.http.get<ApiResponse<PagedResponse<LoginLog>>>(`${this.baseUrl}/logins`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Change Logs
  // ============================================

  /**
   * Get data changes (modifications)
   */
  getChanges(params: AuditSearchParams): Observable<PagedResponse<AuditLog>> {
    return this.searchLogs({
      ...params,
      action: AuditAction.UPDATE
    });
  }

  /**
   * Get field-level changes for a specific resource
   */
  getResourceChanges(resourceType: string, resourceId: string): Observable<{
    field: string;
    changes: { timestamp: string; userId: string; userName: string; oldValue: any; newValue: any }[];
  }[]> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/changes/${resourceType}/${resourceId}`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Export
  // ============================================

  /**
   * Export audit logs
   */
  exportLogs(params: AuditSearchParams, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    const httpParams = this.buildParams({ ...params, format });
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Export login logs
   */
  exportLogins(params: LoginSearchParams, format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    const httpParams = this.buildParams({ ...params, format });
    return this.http.get(`${this.baseUrl}/logins/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // ============================================
  // Alerts & Security
  // ============================================

  /**
   * Report suspicious activity
   */
  reportSuspiciousActivity(data: {
    loginId?: string;
    userId?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/security/report`, data);
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(params?: QueryParams): Observable<PagedResponse<any>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(`${this.baseUrl}/security/alerts`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Block IP address
   */
  blockIp(ipAddress: string, reason: string, duration?: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/security/block-ip`, {
      ipAddress,
      reason,
      duration // in hours, null for permanent
    });
  }

  /**
   * Unblock IP address
   */
  unblockIp(ipAddress: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/security/block-ip/${encodeURIComponent(ipAddress)}`);
  }

  /**
   * Get blocked IPs
   */
  getBlockedIps(): Observable<{ ipAddress: string; reason: string; blockedAt: string; expiresAt?: string }[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/security/blocked-ips`).pipe(
      map(response => response.data)
    );
  }
}
