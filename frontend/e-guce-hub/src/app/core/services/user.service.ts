import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// User model
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  language: string;
  organizationId?: string;
  organizationName?: string;
  roles: string[];
  permissions: string[];
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED'
}

export interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  language?: string;
  organizationId?: string;
  roles: string[];
  sendWelcomeEmail?: boolean;
  generatePassword?: boolean;
  password?: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: string;
  organizationId?: string;
  roles?: string[];
}

export interface UserSearchParams extends QueryParams {
  search?: string;
  status?: UserStatus;
  role?: string;
  organizationId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  constructor() {
    super(inject(HttpClient), environment.services.users);
  }

  /**
   * Search users with filters
   */
  search(params: UserSearchParams): Observable<PagedResponse<User>> {
    return this.getAll(params);
  }

  /**
   * Get current authenticated user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/me`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(data: Partial<UserUpdateRequest>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/me`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Change user status (activate, deactivate, suspend, lock)
   */
  changeStatus(userId: string, status: UserStatus, reason?: string): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${userId}/status`, {
      status,
      reason
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Assign roles to user
   */
  assignRoles(userId: string, roles: string[]): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${userId}/roles`, { roles }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Reset user password (admin action)
   */
  resetPassword(userId: string, sendEmail: boolean = true): Observable<{ temporaryPassword?: string }> {
    return this.http.post<ApiResponse<{ temporaryPassword?: string }>>(`${this.baseUrl}/${userId}/reset-password`, {
      sendEmail
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Change own password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/me/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Enable/disable two-factor authentication
   */
  toggle2FA(userId: string, enabled: boolean): Observable<{ secret?: string; qrCode?: string }> {
    return this.http.post<ApiResponse<{ secret?: string; qrCode?: string }>>(`${this.baseUrl}/${userId}/2fa`, {
      enabled
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user activity/audit log
   */
  getActivityLog(userId: string, params?: QueryParams): Observable<PagedResponse<any>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(`${this.baseUrl}/${userId}/activity`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get active sessions for user
   */
  getSessions(userId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${userId}/sessions`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Terminate specific session
   */
  terminateSession(userId: string, sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/sessions/${sessionId}`);
  }

  /**
   * Terminate all sessions for user
   */
  terminateAllSessions(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/sessions`);
  }

  /**
   * Import users from CSV/Excel
   */
  importUsers(file: File, options?: { sendEmails?: boolean; skipDuplicates?: boolean }): Observable<{
    imported: number;
    skipped: number;
    errors: { row: number; error: string }[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/import`, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Export users to CSV
   */
  exportUsers(params?: UserSearchParams): Observable<Blob> {
    const httpParams = this.buildParams(params);
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
