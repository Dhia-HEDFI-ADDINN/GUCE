/**
 * Notification System Models for E-GUCE Hub
 * Manages alerts and notifications with configurable levels
 */

export enum NotificationLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum NotificationType {
  // System notifications
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  MAINTENANCE = 'MAINTENANCE',

  // Tenant notifications
  TENANT_STATUS = 'TENANT_STATUS',
  TENANT_HEALTH = 'TENANT_HEALTH',
  TENANT_DEPLOYMENT = 'TENANT_DEPLOYMENT',

  // User notifications
  USER_ACTION = 'USER_ACTION',
  USER_MENTION = 'USER_MENTION',
  TASK_ASSIGNED = 'TASK_ASSIGNED',

  // Security notifications
  SECURITY_ALERT = 'SECURITY_ALERT',
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',

  // Performance notifications
  PERFORMANCE_ALERT = 'PERFORMANCE_ALERT',
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
  RESOURCE_WARNING = 'RESOURCE_WARNING',

  // Business notifications
  TRANSACTION_STATUS = 'TRANSACTION_STATUS',
  WORKFLOW_UPDATE = 'WORKFLOW_UPDATE',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',

  // Integration notifications
  API_ERROR = 'API_ERROR',
  SYNC_STATUS = 'SYNC_STATUS',
  WEBHOOK_FAILURE = 'WEBHOOK_FAILURE'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK'
}

export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;

  // Targeting
  userId?: string;
  userIds?: string[];
  roleIds?: string[];
  tenantId?: string;
  broadcast?: boolean;

  // Content
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  data?: Record<string, any>;

  // Status
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;

  // Timing
  createdAt: Date;
  expiresAt?: Date;
  scheduledFor?: Date;

  // Source
  source: string;
  sourceId?: string;

  // Channels
  channels: NotificationChannel[];
  channelStatus?: Record<NotificationChannel, 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'>;
}

export interface NotificationPreferences {
  userId: string;

  // Global settings
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;

  // Channel preferences
  channels: {
    [channel in NotificationChannel]: boolean;
  };

  // Level filtering
  minimumLevel: NotificationLevel;

  // Type preferences
  typePreferences: {
    [type in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      level?: NotificationLevel;
    };
  };

  // Frequency
  digestEnabled: boolean;
  digestFrequency?: 'HOURLY' | 'DAILY' | 'WEEKLY';
  digestTime?: string; // HH:mm format

  // Email specific
  emailAddress?: string;
  emailFormat?: 'HTML' | 'TEXT';

  // SMS specific
  phoneNumber?: string;

  // Push specific
  pushToken?: string;
  pushDevices?: { id: string; name: string; token: string }[];
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  name: string;
  description?: string;

  // Templates per channel
  templates: {
    [channel in NotificationChannel]?: {
      subject?: string;
      title: string;
      body: string;
      format?: 'TEXT' | 'HTML' | 'MARKDOWN';
    };
  };

  // Variables
  variables: string[];
  defaultData?: Record<string, any>;

  // Settings
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilter {
  types?: NotificationType[];
  levels?: NotificationLevel[];
  read?: boolean;
  dismissed?: boolean;
  startDate?: Date;
  endDate?: Date;
  tenantId?: string;
  source?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byLevel: Record<NotificationLevel, number>;
  byType: Record<string, number>;
  recentCount: number; // Last 24h
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

// Real-time notification event
export interface NotificationEvent {
  action: 'NEW' | 'UPDATE' | 'DELETE' | 'READ' | 'DISMISS';
  notification: Notification;
  timestamp: Date;
}
