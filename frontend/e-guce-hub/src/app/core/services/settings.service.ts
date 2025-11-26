import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Hub settings model
export interface HubSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  billing: BillingSettings;
  generator: GeneratorSettings;
  monitoring: MonitoringSettings;
}

export interface GeneralSettings {
  hubName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
    historyCount: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeoutMinutes: number;
    requireMfa: boolean;
    mfaMethods: ('TOTP' | 'SMS' | 'EMAIL')[];
  };
  loginPolicy: {
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
    requireCaptchaAfterAttempts: number;
  };
  ipWhitelist: string[];
  ipBlacklist: string[];
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    useTls: boolean;
  };
  sms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    senderId: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    secret: string;
    events: string[];
  };
  templates: {
    id: string;
    name: string;
    subject: string;
    body: string;
    channels: ('email' | 'sms' | 'push')[];
  }[];
}

export interface BillingSettings {
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  autoInvoicing: boolean;
  invoicingDay: number; // Day of month
  reminderDays: number[];
  defaultPlanId: string;
}

export interface GeneratorSettings {
  defaultTemplates: {
    infrastructure: string;
    frontend: string;
    backend: string;
  };
  resourceLimits: {
    maxConcurrentJobs: number;
    maxJobDurationMinutes: number;
    maxOutputSizeGb: number;
  };
  deploymentOptions: {
    autoDeployAfterGeneration: boolean;
    defaultEnvironment: 'development' | 'staging' | 'production';
    enableRollback: boolean;
  };
}

export interface MonitoringSettings {
  metricsRetentionDays: number;
  logsRetentionDays: number;
  alertingEnabled: boolean;
  defaultAlertRecipients: string[];
  healthCheckIntervalSeconds: number;
  dashboardRefreshIntervalSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly baseUrl = `${environment.api.baseUrl}${environment.services.settings}`;
  private http = inject(HttpClient);

  /**
   * Get all settings
   */
  getAll(): Observable<HubSettings> {
    return this.http.get<ApiResponse<HubSettings>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get specific settings section
   */
  getSection<K extends keyof HubSettings>(section: K): Observable<HubSettings[K]> {
    return this.http.get<ApiResponse<HubSettings[K]>>(`${this.baseUrl}/${section}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update settings section
   */
  updateSection<K extends keyof HubSettings>(section: K, settings: Partial<HubSettings[K]>): Observable<HubSettings[K]> {
    return this.http.put<ApiResponse<HubSettings[K]>>(`${this.baseUrl}/${section}`, settings).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // General Settings
  // ============================================

  getGeneralSettings(): Observable<GeneralSettings> {
    return this.getSection('general');
  }

  updateGeneralSettings(settings: Partial<GeneralSettings>): Observable<GeneralSettings> {
    return this.updateSection('general', settings);
  }

  toggleMaintenanceMode(enabled: boolean, message?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/general/maintenance`, {
      enabled,
      message
    });
  }

  // ============================================
  // Security Settings
  // ============================================

  getSecuritySettings(): Observable<SecuritySettings> {
    return this.getSection('security');
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<SecuritySettings> {
    return this.updateSection('security', settings);
  }

  updatePasswordPolicy(policy: SecuritySettings['passwordPolicy']): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/security/password-policy`, policy);
  }

  updateSessionPolicy(policy: SecuritySettings['sessionPolicy']): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/security/session-policy`, policy);
  }

  addToIpWhitelist(ip: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/security/ip-whitelist`, { ip });
  }

  removeFromIpWhitelist(ip: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/security/ip-whitelist/${encodeURIComponent(ip)}`);
  }

  // ============================================
  // Notification Settings
  // ============================================

  getNotificationSettings(): Observable<NotificationSettings> {
    return this.getSection('notifications');
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.updateSection('notifications', settings);
  }

  testEmailConfiguration(): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.baseUrl}/notifications/test-email`, {}).pipe(
      map(response => response.data)
    );
  }

  testSmsConfiguration(phoneNumber: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.baseUrl}/notifications/test-sms`, {
      phoneNumber
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Notification Templates
  // ============================================

  getNotificationTemplates(): Observable<NotificationSettings['templates']> {
    return this.http.get<ApiResponse<NotificationSettings['templates']>>(`${this.baseUrl}/notifications/templates`).pipe(
      map(response => response.data)
    );
  }

  updateNotificationTemplate(templateId: string, template: Partial<NotificationSettings['templates'][0]>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/notifications/templates/${templateId}`, template);
  }

  previewNotificationTemplate(templateId: string, variables: Record<string, string>): Observable<{ subject: string; body: string }> {
    return this.http.post<ApiResponse<{ subject: string; body: string }>>(`${this.baseUrl}/notifications/templates/${templateId}/preview`, {
      variables
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Billing Settings
  // ============================================

  getBillingSettings(): Observable<BillingSettings> {
    return this.getSection('billing');
  }

  updateBillingSettings(settings: Partial<BillingSettings>): Observable<BillingSettings> {
    return this.updateSection('billing', settings);
  }

  // ============================================
  // Generator Settings
  // ============================================

  getGeneratorSettings(): Observable<GeneratorSettings> {
    return this.getSection('generator');
  }

  updateGeneratorSettings(settings: Partial<GeneratorSettings>): Observable<GeneratorSettings> {
    return this.updateSection('generator', settings);
  }

  // ============================================
  // Monitoring Settings
  // ============================================

  getMonitoringSettings(): Observable<MonitoringSettings> {
    return this.getSection('monitoring');
  }

  updateMonitoringSettings(settings: Partial<MonitoringSettings>): Observable<MonitoringSettings> {
    return this.updateSection('monitoring', settings);
  }

  // ============================================
  // Backup & Export
  // ============================================

  exportSettings(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      responseType: 'blob'
    });
  }

  importSettings(file: File): Observable<{ success: boolean; importedSections: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ success: boolean; importedSections: string[] }>>(`${this.baseUrl}/import`, formData).pipe(
      map(response => response.data)
    );
  }

  resetToDefaults(section?: keyof HubSettings): Observable<void> {
    const params = section ? { section } : {};
    return this.http.post<void>(`${this.baseUrl}/reset`, {}, { params });
  }
}
