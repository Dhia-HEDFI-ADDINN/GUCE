import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Role model
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  scope: RoleScope;
  isSystem: boolean;
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  actions: PermissionAction[];
}

export interface PermissionAction {
  code: string;
  name: string;
  granted: boolean;
}

export enum RoleScope {
  HUB = 'HUB',
  INSTANCE = 'INSTANCE',
  GLOBAL = 'GLOBAL'
}

export interface RoleCreateRequest {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[]; // Permission codes
  scope: RoleScope;
}

export interface RoleUpdateRequest {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleSearchParams extends QueryParams {
  search?: string;
  scope?: RoleScope;
  includeSystem?: boolean;
}

// Permission modules for UI grouping
export interface PermissionModule {
  code: string;
  name: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<Role> {
  constructor() {
    super(inject(HttpClient), environment.services.roles);
  }

  /**
   * Search roles with filters
   */
  search(params: RoleSearchParams): Observable<PagedResponse<Role>> {
    return this.getAll(params);
  }

  /**
   * Get all available permissions grouped by module
   */
  getAllPermissions(): Observable<PermissionModule[]> {
    return this.http.get<ApiResponse<PermissionModule[]>>(`${this.baseUrl}/permissions`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get permissions for a specific role
   */
  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/${roleId}/permissions`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update role permissions
   */
  updatePermissions(roleId: string, permissions: string[]): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/permissions`, { permissions }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Clone an existing role
   */
  cloneRole(roleId: string, newName: string, newDisplayName: string): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/clone`, {
      name: newName,
      displayName: newDisplayName
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get users assigned to a role
   */
  getRoleUsers(roleId: string, params?: QueryParams): Observable<PagedResponse<any>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(`${this.baseUrl}/${roleId}/users`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check if current user has specific permission
   */
  hasPermission(permissionCode: string): Observable<boolean> {
    return this.http.get<ApiResponse<{ hasPermission: boolean }>>(`${this.baseUrl}/check-permission`, {
      params: { permission: permissionCode }
    }).pipe(
      map(response => response.data.hasPermission)
    );
  }

  /**
   * Get current user's effective permissions
   */
  getMyPermissions(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/my-permissions`).pipe(
      map(response => response.data)
    );
  }
}
