import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Authentication Service for E-GUCE Hub
 * Wraps Keycloak and provides user management, roles, and permissions
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // User state
  private currentUser = signal<HubUser | null>(null);
  private userPermissions = signal<string[]>([]);
  private initialized = new BehaviorSubject<boolean>(false);

  // Computed properties
  readonly user = computed(() => this.currentUser());
  readonly permissions = computed(() => this.userPermissions());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isInitialized$ = this.initialized.asObservable();

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
      redirectUri: redirectUri || window.location.origin + '/dashboard'
    });
  }

  /**
   * Logout
   */
  logout(redirectUri?: string): Promise<void> {
    // Clear local state
    this.currentUser.set(null);
    this.userPermissions.set([]);
    (window as any).keycloakInstance = null;

    return this.keycloak.logout(redirectUri || window.location.origin);
  }

  /**
   * Register new user
   */
  register(redirectUri?: string): Promise<void> {
    return this.keycloak.register({
      redirectUri: redirectUri || window.location.origin
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

      const user: HubUser = {
        id: backendUser?.id || tokenParsed?.sub || '',
        keycloakId: tokenParsed?.sub || '',
        email: keycloakProfile.email || '',
        firstName: keycloakProfile.firstName || '',
        lastName: keycloakProfile.lastName || '',
        username: keycloakProfile.username || '',
        roles: this.extractRoles(tokenParsed),
        permissions: backendUser?.permissions || [],
        isSuperAdmin: this.extractRoles(tokenParsed).includes('hub-admin'),
        avatar: backendUser?.profile?.avatar,
        lastLogin: backendUser?.lastLogin
      };

      this.currentUser.set(user);
      this.userPermissions.set(user.permissions);
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
}

/**
 * Hub User interface
 */
export interface HubUser {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  avatar?: string;
  lastLogin?: string;
}
