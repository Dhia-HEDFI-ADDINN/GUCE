import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Permission Guard for E-GUCE Hub
 * Checks if user has required permissions to access a route
 *
 * Usage in routes:
 * {
 *   path: 'admin/users',
 *   component: UsersComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permissions: ['users:view'] }
 * }
 *
 * For multiple permissions (any):
 * data: { permissions: ['users:view', 'users:admin'], permissionMode: 'any' }
 *
 * For multiple permissions (all):
 * data: { permissions: ['users:view', 'users:update'], permissionMode: 'all' }
 */
export const PermissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[];
  const permissionMode = route.data['permissionMode'] as 'any' | 'all' || 'any';

  // No permissions required
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check permissions
  let hasPermission: boolean;
  if (permissionMode === 'all') {
    hasPermission = authService.hasAllPermissions(requiredPermissions);
  } else {
    hasPermission = authService.hasAnyPermission(requiredPermissions);
  }

  if (!hasPermission) {
    await router.navigate(['/dashboard'], {
      queryParams: { error: 'permission_denied' }
    });
    return false;
  }

  return true;
};

/**
 * Permission Guard for child routes
 */
export const PermissionChildGuard: CanActivateChildFn = async (route: ActivatedRouteSnapshot) => {
  return PermissionGuard(route, {} as any);
};

/**
 * Factory function to create a guard with specific permissions
 *
 * Usage:
 * canActivate: [hasPermission('users:view')]
 */
export function hasPermission(...permissions: string[]): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasAnyPermission(permissions)) {
      await router.navigate(['/dashboard'], {
        queryParams: { error: 'permission_denied' }
      });
      return false;
    }

    return true;
  };
}

/**
 * Factory function to create a guard requiring all permissions
 */
export function hasAllPermissions(...permissions: string[]): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasAllPermissions(permissions)) {
      await router.navigate(['/dashboard'], {
        queryParams: { error: 'permission_denied' }
      });
      return false;
    }

    return true;
  };
}

/**
 * Guard for Hub Admin only routes
 */
export const HubAdminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasRole('hub-admin')) {
    await router.navigate(['/dashboard'], {
      queryParams: { error: 'admin_required' }
    });
    return false;
  }

  return true;
};
