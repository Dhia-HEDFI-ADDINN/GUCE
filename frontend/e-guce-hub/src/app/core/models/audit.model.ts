/**
 * Audit Trail Models for E-GUCE Hub
 * Tracks all actions performed in the system
 */

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',

  // Tenant Management
  TENANT_CREATE = 'TENANT_CREATE',
  TENANT_UPDATE = 'TENANT_UPDATE',
  TENANT_DELETE = 'TENANT_DELETE',
  TENANT_DEPLOY = 'TENANT_DEPLOY',
  TENANT_START = 'TENANT_START',
  TENANT_STOP = 'TENANT_STOP',
  TENANT_RESTART = 'TENANT_RESTART',
  TENANT_MAINTENANCE = 'TENANT_MAINTENANCE',

  // Module Management
  MODULE_ENABLE = 'MODULE_ENABLE',
  MODULE_DISABLE = 'MODULE_DISABLE',
  MODULE_CONFIG = 'MODULE_CONFIG',

  // User Management
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ROLE_ASSIGN = 'USER_ROLE_ASSIGN',
  USER_ROLE_REVOKE = 'USER_ROLE_REVOKE',

  // Configuration
  CONFIG_UPDATE = 'CONFIG_UPDATE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',

  // Data Operations
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  DATA_DELETE = 'DATA_DELETE',

  // System
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  SYSTEM_RESTORE = 'SYSTEM_RESTORE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',

  // Access
  RESOURCE_ACCESS = 'RESOURCE_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  TENANT = 'TENANT',
  USER = 'USER',
  MODULE = 'MODULE',
  CONFIGURATION = 'CONFIGURATION',
  DATA = 'DATA',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY'
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;

  // Actor information
  userId: string;
  userName: string;
  userEmail?: string;
  userRole?: string;

  // Context
  tenantId?: string;
  tenantCode?: string;

  // Target resource
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;

  // Details
  description: string;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;

  // Technical info
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Result
  success: boolean;
  errorMessage?: string;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  actions?: AuditAction[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  userId?: string;
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  searchTerm?: string;
}

export interface AuditStats {
  totalEntries: number;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  byAction: Record<string, number>;
  recentActivity: AuditEntry[];
  topUsers: { userId: string; userName: string; count: number }[];
  failedActions: number;
  securityIncidents: number;
}

export interface AuditExportOptions {
  format: 'CSV' | 'JSON' | 'PDF';
  filter?: AuditFilter;
  columns?: string[];
  includeDetails?: boolean;
}
