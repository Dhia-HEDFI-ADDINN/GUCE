/**
 * Notification System Models for GUCE Instance
 */

export enum NotificationLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum NotificationType {
  // Declarations
  DECLARATION_STATUS = 'DECLARATION_STATUS',
  DECLARATION_APPROVED = 'DECLARATION_APPROVED',
  DECLARATION_REJECTED = 'DECLARATION_REJECTED',
  DECLARATION_PENDING = 'DECLARATION_PENDING',

  // Tasks
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_REMINDER = 'TASK_REMINDER',
  TASK_COMPLETED = 'TASK_COMPLETED',

  // Payments
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // Documents
  DOCUMENT_READY = 'DOCUMENT_READY',
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  CERTIFICATE_READY = 'CERTIFICATE_READY',

  // System
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  MAINTENANCE = 'MAINTENANCE',

  // Security
  SECURITY_ALERT = 'SECURITY_ALERT',
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  userId?: string;
  organizationId?: string;
  declarationId?: string;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;
  channels: NotificationChannel[];
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  channels: Record<NotificationChannel, boolean>;
  minimumLevel: NotificationLevel;
  typePreferences: Record<NotificationType, { enabled: boolean; channels: NotificationChannel[] }>;
  digestEnabled: boolean;
  digestFrequency?: 'DAILY' | 'WEEKLY';
  emailAddress?: string;
  phoneNumber?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byLevel: Record<NotificationLevel, number>;
  byType: Record<string, number>;
}
