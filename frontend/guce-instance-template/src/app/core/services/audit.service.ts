import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Audit log models
export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  category: AuditCategory;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId?: string;
  organizationName?: string;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  details: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
}

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // CRUD
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  // Declaration specific
  DECLARATION_CREATED = 'DECLARATION_CREATED',
  DECLARATION_SUBMITTED = 'DECLARATION_SUBMITTED',
  DECLARATION_APPROVED = 'DECLARATION_APPROVED',
  DECLARATION_REJECTED = 'DECLARATION_REJECTED',
  DECLARATION_AMENDED = 'DECLARATION_AMENDED',

  // Workflow
  TASK_CLAIMED = 'TASK_CLAIMED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FORWARDED = 'TASK_FORWARDED',
  DECISION_MADE = 'DECISION_MADE',

  // Payments
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',

  // Documents
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED',

  // Admin
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DISABLED = 'USER_DISABLED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',

  // Export
  DATA_EXPORTED = 'DATA_EXPORTED',
  REPORT_GENERATED = 'REPORT_GENERATED'
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA = 'DATA',
  DECLARATION = 'DECLARATION',
  WORKFLOW = 'WORKFLOW',
  PAYMENT = 'PAYMENT',
  DOCUMENT = 'DOCUMENT',
  ADMINISTRATION = 'ADMINISTRATION',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM'
}

export interface AuditSearchParams extends QueryParams {
  userId?: string;
  organizationId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  resourceType?: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  startDate?: string;
  endDate?: string;
  search?: string;
  ipAddress?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId?: string;
  organizationName?: string;
  timestamp: string;
  success: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  device?: {
    type: string;
    os: string;
    browser: string;
  };
  suspicious: boolean;
  suspiciousReasons?: string[];
}

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;
  ipAddress?: string;
  details: Record<string, any>;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export enum SecurityAlertType {
  BRUTE_FORCE = 'BRUTE_FORCE',
  UNUSUAL_LOCATION = 'UNUSUAL_LOCATION',
  UNUSUAL_TIME = 'UNUSUAL_TIME',
  MULTIPLE_SESSIONS = 'MULTIPLE_SESSIONS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MALWARE_DETECTED = 'MALWARE_DETECTED'
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly baseUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.baseUrl = `${environment.api.baseUrl}/api/v1/audit`;
  }

  // ============================================
  // Audit Logs
  // ============================================

  /**
   * Search audit logs
   */
  searchLogs(params: AuditSearchParams): Observable<PagedResponse<AuditLog>> {
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/logs`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get single audit log
   */
  getLogById(logId: string): Observable<AuditLog> {
    return this.http.get<ApiResponse<AuditLog>>(`${this.baseUrl}/logs/${logId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for a specific resource
   */
  getResourceLogs(resourceType: string, resourceId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/logs/resource/${resourceType}/${resourceId}`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for current user
   */
  getMyLogs(params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/logs/me`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for specific user
   */
  getUserLogs(userId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/logs/user/${userId}`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get audit logs for organization
   */
  getOrganizationLogs(organizationId: string, params?: QueryParams): Observable<PagedResponse<AuditLog>> {
    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/logs/organization/${organizationId}`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Login Logs
  // ============================================

  /**
   * Get login history
   */
  getLoginLogs(params?: QueryParams & {
    userId?: string;
    success?: boolean;
    suspicious?: boolean;
    startDate?: string;
    endDate?: string;
  }): Observable<PagedResponse<LoginLog>> {
    return this.http.get<ApiResponse<PagedResponse<LoginLog>>>(`${this.baseUrl}/logins`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get my login history
   */
  getMyLoginHistory(params?: QueryParams): Observable<PagedResponse<LoginLog>> {
    return this.http.get<ApiResponse<PagedResponse<LoginLog>>>(`${this.baseUrl}/logins/me`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user's active sessions
   */
  getActiveSessions(userId?: string): Observable<any[]> {
    const url = userId ? `${this.baseUrl}/sessions/user/${userId}` : `${this.baseUrl}/sessions/me`;
    return this.http.get<ApiResponse<any[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Terminate session
   */
  terminateSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  /**
   * Terminate all sessions for user (except current)
   */
  terminateAllSessions(userId?: string): Observable<void> {
    const url = userId ? `${this.baseUrl}/sessions/user/${userId}/terminate-all` : `${this.baseUrl}/sessions/me/terminate-all`;
    return this.http.post<void>(url, {});
  }

  // ============================================
  // Security Alerts
  // ============================================

  /**
   * Get security alerts
   */
  getSecurityAlerts(params?: QueryParams & {
    type?: SecurityAlertType;
    severity?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<PagedResponse<SecurityAlert>> {
    return this.http.get<ApiResponse<PagedResponse<SecurityAlert>>>(`${this.baseUrl}/security-alerts`, {
      params: params as any
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get security alert by ID
   */
  getSecurityAlertById(alertId: string): Observable<SecurityAlert> {
    return this.http.get<ApiResponse<SecurityAlert>>(`${this.baseUrl}/security-alerts/${alertId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update security alert status
   */
  updateAlertStatus(alertId: string, status: SecurityAlert['status'], resolution?: string): Observable<SecurityAlert> {
    return this.http.patch<ApiResponse<SecurityAlert>>(`${this.baseUrl}/security-alerts/${alertId}/status`, {
      status,
      resolution
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Assign alert to user
   */
  assignAlert(alertId: string, userId: string): Observable<SecurityAlert> {
    return this.http.patch<ApiResponse<SecurityAlert>>(`${this.baseUrl}/security-alerts/${alertId}/assign`, {
      userId
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Statistics & Reports
  // ============================================

  /**
   * Get audit statistics
   */
  getStats(period?: { start: string; end: string }): Observable<{
    totalLogs: number;
    byCategory: { category: string; count: number }[];
    byAction: { action: string; count: number }[];
    byStatus: { status: string; count: number }[];
    byDay: { date: string; count: number }[];
    topUsers: { userId: string; userName: string; count: number }[];
  }> {
    const params: any = {};
    if (period) {
      params.startDate = period.start;
      params.endDate = period.end;
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get security dashboard stats
   */
  getSecurityStats(): Observable<{
    activeAlerts: number;
    alertsBySeverity: { severity: string; count: number }[];
    recentThreats: SecurityAlert[];
    failedLoginsToday: number;
    suspiciousActivities: number;
    blockedIPs: number;
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/security-stats`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Export
  // ============================================

  /**
   * Export audit logs
   */
  exportLogs(params: AuditSearchParams, format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/logs/export`, {
      params: { ...params, format } as any,
      responseType: 'blob'
    });
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(period: { start: string; end: string }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/reports/compliance`, period, {
      responseType: 'blob'
    });
  }

  /**
   * Generate security report
   */
  generateSecurityReport(period: { start: string; end: string }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/reports/security`, period, {
      responseType: 'blob'
    });
  }
}
