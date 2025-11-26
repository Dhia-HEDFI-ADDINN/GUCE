import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Role models
export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  type: RoleType;
  scope: RoleScope;
  permissions: Permission[];
  isSystem: boolean;
  isDefault: boolean;
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum RoleType {
  OPERATOR = 'OPERATOR',           // External users (enterprises)
  AGENT = 'AGENT',                 // Administration agents
  SUPERVISOR = 'SUPERVISOR',       // Supervisors
  ADMIN = 'ADMIN',                 // Instance administrators
  SYSTEM = 'SYSTEM'                // System roles
}

export enum RoleScope {
  GLOBAL = 'GLOBAL',               // Full access across instance
  ORGANIZATION = 'ORGANIZATION',   // Limited to own organization
  DEPARTMENT = 'DEPARTMENT',       // Limited to department
  PERSONAL = 'PERSONAL'            // Only own data
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
  description: string;
}

// Permission modules
export const PERMISSION_MODULES = {
  DECLARATIONS: 'declarations',
  PROCEDURES: 'procedures',
  PAYMENTS: 'payments',
  DOCUMENTS: 'documents',
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  ROLES: 'roles',
  WORKFLOW: 'workflow',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  AUDIT: 'audit'
};

// Standard permission actions
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  ADMIN: 'admin'
};

export interface RoleSearchParams extends QueryParams {
  search?: string;
  type?: RoleType;
  scope?: RoleScope;
  isSystem?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<Role> {
  constructor() {
    super(inject(HttpClient), environment.services.roles);
  }

  /**
   * Search roles
   */
  search(params: RoleSearchParams): Observable<PagedResponse<Role>> {
    return this.getAll(params);
  }

  /**
   * Get role by code
   */
  getByCode(code: string): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/code/${code}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get roles by type
   */
  getByType(type: RoleType): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/type/${type}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get assignable roles for current user
   * (Can only assign roles at or below own level)
   */
  getAssignableRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/assignable`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Clone a role
   */
  clone(roleId: string, data: { code: string; name: string }): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/clone`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Set role as default for type
   */
  setAsDefault(roleId: string, type: RoleType): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/set-default`, { type }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Permissions Management
  // ============================================

  /**
   * Get all available permissions
   */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(`${environment.api.baseUrl}${environment.services.permissions}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get permissions grouped by module
   */
  getPermissionsByModule(): Observable<Record<string, Permission[]>> {
    return this.http.get<ApiResponse<Record<string, Permission[]>>>(`${environment.api.baseUrl}${environment.services.permissions}/by-module`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get role's permissions
   */
  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/${roleId}/permissions`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update role permissions
   */
  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/permissions`, { permissionIds }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add permissions to role
   */
  addPermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/permissions/add`, { permissionIds }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove permissions from role
   */
  removePermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/${roleId}/permissions/remove`, { permissionIds }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Role Users
  // ============================================

  /**
   * Get users with role
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
   * Assign role to users
   */
  assignToUsers(roleId: string, userIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${roleId}/users`, { userIds });
  }

  /**
   * Remove role from users
   */
  removeFromUsers(roleId: string, userIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${roleId}/users`, {
      body: { userIds }
    });
  }

  // ============================================
  // Permission Checking (Client-side helpers)
  // ============================================

  /**
   * Check if user has permission
   */
  hasPermission(userPermissions: string[], permission: string): boolean {
    // Check for admin wildcard
    if (userPermissions.includes('*') || userPermissions.includes('admin:*')) {
      return true;
    }

    // Check exact match
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check module wildcard (e.g., "declarations:*" matches "declarations:view")
    const [module] = permission.split(':');
    if (userPermissions.includes(`${module}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(userPermissions, p));
  }

  /**
   * Check if user has all permissions
   */
  hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(userPermissions, p));
  }

  /**
   * Filter list of permissions to only those user has
   */
  filterPermissions(userPermissions: string[], permissions: string[]): string[] {
    return permissions.filter(p => this.hasPermission(userPermissions, p));
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get role statistics
   */
  getStats(): Observable<{
    totalRoles: number;
    byType: { type: RoleType; count: number }[];
    mostUsed: { role: string; count: number }[];
    unusedRoles: Role[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Export
  // ============================================

  /**
   * Export roles configuration
   */
  exportRoles(format: 'json' | 'xlsx' = 'json'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Import roles configuration
   */
  importRoles(file: File, options?: { overwrite: boolean }): Observable<{
    imported: number;
    updated: number;
    errors: string[];
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
}
