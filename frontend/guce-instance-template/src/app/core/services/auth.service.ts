import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Authentication Service for GUCE Instance
 * Wraps Keycloak and provides user management, roles, permissions, and organization context
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // User state
  private currentUser = signal<InstanceUser | null>(null);
  private userPermissions = signal<string[]>([]);
  private userOrganization = signal<UserOrganization | null>(null);
  private initialized = new BehaviorSubject<boolean>(false);

  // Computed properties
  readonly user = computed(() => this.currentUser());
  readonly permissions = computed(() => this.userPermissions());
  readonly organization = computed(() => this.userOrganization());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isInitialized$ = this.initialized.asObservable();

  // User type helpers
  readonly isOperator = computed(() => this.currentUser()?.userType === 'OPERATOR');
  readonly isAgent = computed(() => this.currentUser()?.userType === 'AGENT');
  readonly isAdmin = computed(() => this.currentUser()?.userType === 'ADMIN');

  /**
   * Initialize auth service after Keycloak is ready
   */
  async initialize(): Promise<void> {
    if (await this.keycloak.isLoggedIn()) {
      // Store keycloak instance globally for interceptors
      (window as any).keycloakInstance = this.keycloak.getKeycloakInstance();

      // Load user profile
      await this.loadUserProfile();
    }
    this.initialized.next(true);
  }

  /**
   * Login with Keycloak
   */
  login(redirectUri?: string): Promise<void> {
    return this.keycloak.login({
      redirectUri: redirectUri || window.location.origin + '/portal/dashboard'
    });
  }

  /**
   * Logout
   */
  logout(redirectUri?: string): Promise<void> {
    // Clear local state
    this.currentUser.set(null);
    this.userPermissions.set([]);
    this.userOrganization.set(null);
    (window as any).keycloakInstance = null;

    return this.keycloak.logout(redirectUri || window.location.origin);
  }

  /**
   * Register new user (operator self-registration)
   */
  register(redirectUri?: string): Promise<void> {
    return this.keycloak.register({
      redirectUri: redirectUri || window.location.origin + '/registration-complete'
    });
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): Promise<boolean> {
    return this.keycloak.isLoggedIn();
  }

  /**
   * Get access token
   */
  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  /**
   * Get token parsed (contains claims)
   */
  getTokenParsed(): KeycloakTokenParsed | undefined {
    return this.keycloak.getKeycloakInstance().tokenParsed;
  }

  /**
   * Update token if needed
   */
  updateToken(minValidity: number = 30): Promise<boolean> {
    return this.keycloak.updateToken(minValidity);
  }

  /**
   * Load user profile from backend
   */
  private async loadUserProfile(): Promise<void> {
    try {
      // Get Keycloak profile
      const keycloakProfile = await this.keycloak.loadUserProfile();
      const tokenParsed = this.getTokenParsed();

      // Get additional user data from backend
      const backendUser = await this.fetchBackendUser().toPromise();

      // Determine user type based on roles
      const roles = this.extractRoles(tokenParsed);
      const userType = this.determineUserType(roles);

      const user: InstanceUser = {
        id: backendUser?.id || tokenParsed?.sub || '',
        keycloakId: tokenParsed?.sub || '',
        email: keycloakProfile.email || '',
        firstName: keycloakProfile.firstName || '',
        lastName: keycloakProfile.lastName || '',
        username: keycloakProfile.username || '',
        phone: backendUser?.phone,
        language: backendUser?.language || 'fr',
        roles: roles,
        permissions: backendUser?.permissions || [],
        userType: userType,
        organizationId: backendUser?.organizationId,
        organization: backendUser?.organization,
        profile: backendUser?.profile,
        lastLogin: backendUser?.lastLogin
      };

      this.currentUser.set(user);
      this.userPermissions.set(user.permissions);

      if (user.organization) {
        this.userOrganization.set(user.organization);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  /**
   * Fetch user data from backend
   */
  private fetchBackendUser(): Observable<any> {
    return this.http.get<any>(`${environment.api.baseUrl}${environment.services.users}/me`).pipe(
      map(response => response.data || response),
      catchError(() => of(null))
    );
  }

  /**
   * Extract roles from token
   */
  private extractRoles(tokenParsed: KeycloakTokenParsed | undefined): string[] {
    if (!tokenParsed) return [];

    const roles: string[] = [];

    // Realm roles
    if (tokenParsed.realm_access?.roles) {
      roles.push(...tokenParsed.realm_access.roles);
    }

    // Client roles for this application
    const clientRoles = tokenParsed.resource_access?.[environment.keycloak.clientId]?.roles;
    if (clientRoles) {
      roles.push(...clientRoles);
    }

    return [...new Set(roles)]; // Remove duplicates
  }

  /**
   * Determine user type based on roles
   */
  private determineUserType(roles: string[]): UserType {
    if (roles.includes('instance-admin') || roles.includes('admin')) {
      return 'ADMIN';
    }
    if (roles.includes('supervisor')) {
      return 'SUPERVISOR';
    }
    if (roles.includes('agent') || roles.some(r => r.startsWith('agent-'))) {
      return 'AGENT';
    }
    return 'OPERATOR';
  }

  /**
   * Get user's Keycloak roles
   */
  getRoles(): string[] {
    return this.keycloak.getUserRoles(true);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const perms = this.userPermissions();

    // Admins have all permissions
    if (this.isAdmin()) {
      return true;
    }

    // Check for admin wildcard
    if (perms.includes('*') || perms.includes('admin:*')) {
      return true;
    }

    // Check exact match
    if (perms.includes(permission)) {
      return true;
    }

    // Check module wildcard
    const [module] = permission.split(':');
    return perms.includes(`${module}:*`);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Check if user can access a specific organization
   */
  canAccessOrganization(organizationId: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Admins and agents can access all organizations
    if (user.userType === 'ADMIN' || user.userType === 'SUPERVISOR') {
      return true;
    }

    // Agents can access their assigned organizations
    if (user.userType === 'AGENT') {
      // Check if agent has access through assignments
      return true; // Backend will validate
    }

    // Operators can only access their own organization
    return user.organizationId === organizationId;
  }

  /**
   * Get account management URL
   */
  getAccountUrl(): string {
    return `${environment.keycloak.url}/realms/${environment.keycloak.realm}/account`;
  }

  /**
   * Open account management in new tab
   */
  openAccountManagement(): void {
    window.open(this.getAccountUrl(), '_blank');
  }

  /**
   * Refresh user profile
   */
  async refreshProfile(): Promise<void> {
    await this.loadUserProfile();
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim() || user.username;
  }

  /**
   * Get initials for avatar
   */
  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?';
  }
}

/**
 * Instance User interface
 */
export interface InstanceUser {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  language: string;
  roles: string[];
  permissions: string[];
  userType: UserType;
  organizationId?: string;
  organization?: UserOrganization;
  profile?: {
    avatar?: string;
    jobTitle?: string;
    department?: string;
  };
  lastLogin?: string;
}

export type UserType = 'OPERATOR' | 'AGENT' | 'SUPERVISOR' | 'ADMIN';

export interface UserOrganization {
  id: string;
  name: string;
  type: string;
  niu?: string;
  status: string;
}
