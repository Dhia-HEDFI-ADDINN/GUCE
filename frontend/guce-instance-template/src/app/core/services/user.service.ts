import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// User model for Instance
export interface User {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  language: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    type: OrganizationType;
    niu?: string;
  };
  roles: UserRole[];
  permissions: string[];
  status: UserStatus;
  profile?: UserProfile;
  preferences?: UserPreferences;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  avatar?: string;
  jobTitle?: string;
  department?: string;
  signature?: string;
  bio?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    categories: string[];
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  scope: string[];
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED'
}

export enum OrganizationType {
  OPERATOR = 'OPERATOR',
  ADMINISTRATION = 'ADMINISTRATION',
  INTERMEDIARY = 'INTERMEDIARY',
  BANK = 'BANK',
  PORT = 'PORT',
  OTHER = 'OTHER'
}

export interface UserSearchParams extends QueryParams {
  search?: string;
  status?: UserStatus;
  role?: string;
  organizationId?: string;
  organizationType?: OrganizationType;
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
   * Get current authenticated user
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/me`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(profile: Partial<UserProfile>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/me/profile`, profile).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<ApiResponse<UserPreferences>>(`${this.baseUrl}/me/preferences`, preferences).pipe(
      map(response => response.data)
    );
  }

  /**
   * Upload avatar
   */
  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ApiResponse<{ url: string }>>(`${this.baseUrl}/me/avatar`, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Change user status
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
  assignRoles(userId: string, roleIds: string[]): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${userId}/roles`, { roleIds }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Assign user to organization
   */
  assignToOrganization(userId: string, organizationId: string): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${userId}/organization`, { organizationId }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user's permissions (effective permissions from all roles)
   */
  getEffectivePermissions(userId?: string): Observable<string[]> {
    const url = userId ? `${this.baseUrl}/${userId}/permissions` : `${this.baseUrl}/me/permissions`;
    return this.http.get<ApiResponse<string[]>>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check if current user has permission
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.http.get<ApiResponse<{ has: boolean }>>(`${this.baseUrl}/me/check-permission`, {
      params: { permission }
    }).pipe(
      map(response => response.data.has)
    );
  }

  /**
   * Get users by organization
   */
  getByOrganization(organizationId: string, params?: QueryParams): Observable<PagedResponse<User>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<User>>>(`${this.baseUrl}/organization/${organizationId}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user activity history
   */
  getActivityHistory(userId?: string, params?: QueryParams): Observable<PagedResponse<any>> {
    const url = userId ? `${this.baseUrl}/${userId}/activity` : `${this.baseUrl}/me/activity`;
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(url, { params: httpParams }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user's notifications settings
   */
  getNotificationSettings(): Observable<UserPreferences['notifications']> {
    return this.http.get<ApiResponse<UserPreferences['notifications']>>(`${this.baseUrl}/me/notifications`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: Partial<UserPreferences['notifications']>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/notifications`, settings);
  }
}
