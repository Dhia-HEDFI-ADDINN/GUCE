import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Permission Guard for GUCE Instance
 * Checks if user has required permissions to access a route
 *
 * Usage in routes:
 * {
 *   path: 'declarations',
 *   component: DeclarationsComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permissions: ['declarations:view'] }
 * }
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
    await router.navigate(['/portal/dashboard'], {
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
 */
export function hasPermission(...permissions: string[]): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasAnyPermission(permissions)) {
      await router.navigate(['/portal/dashboard'], {
        queryParams: { error: 'permission_denied' }
      });
      return false;
    }

    return true;
  };
}

/**
 * Guard for Operator users only (external users)
 */
export const OperatorGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isOperator()) {
    await router.navigate(['/agent/dashboard']);
    return false;
  }

  return true;
};

/**
 * Guard for Agent users only (administration staff)
 */
export const AgentGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAgent() && !authService.isAdmin()) {
    await router.navigate(['/portal/dashboard']);
    return false;
  }

  return true;
};

/**
 * Guard for Admin users only
 */
export const AdminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAdmin()) {
    await router.navigate(['/portal/dashboard'], {
      queryParams: { error: 'admin_required' }
    });
    return false;
  }

  return true;
};

/**
 * Guard for Supervisor and Admin users
 */
export const SupervisorGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user();

  if (user?.userType !== 'SUPERVISOR' && user?.userType !== 'ADMIN') {
    await router.navigate(['/portal/dashboard'], {
      queryParams: { error: 'supervisor_required' }
    });
    return false;
  }

  return true;
};
