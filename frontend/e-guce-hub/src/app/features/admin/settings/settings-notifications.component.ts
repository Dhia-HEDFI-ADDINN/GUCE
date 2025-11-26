import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '@core/services/notification.service';
import {
  NotificationPreferences,
  NotificationLevel,
  NotificationType,
  NotificationChannel
} from '@core/models/notification.model';

interface NotificationTypeConfig {
  type: NotificationType;
  label: string;
  description: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'hub-settings-notifications',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatIconModule, MatSlideToggleModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Preferences de Notifications</h1>
          <p class="page-description">Configurez comment et quand vous souhaitez etre notifie</p>
        </div>
        <button class="btn-primary" (click)="savePreferences()" [disabled]="saving">
          <mat-icon>{{ saving ? 'sync' : 'save' }}</mat-icon>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>

      <div class="settings-content" *ngIf="preferences">
        <!-- Global Settings -->
        <div class="settings-card">
          <div class="card-header">
            <mat-icon>notifications</mat-icon>
            <h2>Parametres Generaux</h2>
          </div>
          <div class="settings-section">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Activer les notifications</span>
                <span class="setting-description">Recevoir des notifications du systeme</span>
              </div>
              <mat-slide-toggle [(ngModel)]="preferences.enabled" color="primary"></mat-slide-toggle>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Niveau minimum</span>
                <span class="setting-description">Ne recevoir que les notifications de ce niveau ou superieur</span>
              </div>
              <mat-form-field appearance="outline" class="level-select">
                <mat-select [(ngModel)]="preferences.minimumLevel">
                  <mat-option *ngFor="let level of levels" [value]="level.value">
                    <div class="level-option">
                      <mat-icon [class]="'level-' + level.value.toLowerCase()">{{ level.icon }}</mat-icon>
                      {{ level.label }}
                    </div>
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Channels -->
        <div class="settings-card">
          <div class="card-header">
            <mat-icon>send</mat-icon>
            <h2>Canaux de Notification</h2>
          </div>
          <div class="settings-section">
            <div class="channel-grid">
              <div class="channel-card" *ngFor="let channel of channels">
                <div class="channel-header">
                  <mat-icon>{{ channel.icon }}</mat-icon>
                  <div class="channel-info">
                    <span class="channel-name">{{ channel.label }}</span>
                    <span class="channel-description">{{ channel.description }}</span>
                  </div>
                  <mat-slide-toggle
                    [(ngModel)]="preferences.channels[channel.value]"
                    color="primary">
                  </mat-slide-toggle>
                </div>
                <div class="channel-config" *ngIf="preferences.channels[channel.value]">
                  <mat-form-field appearance="outline" *ngIf="channel.value === 'EMAIL'">
                    <mat-label>Adresse email</mat-label>
                    <input matInput [(ngModel)]="preferences.emailAddress" type="email">
                  </mat-form-field>
                  <mat-form-field appearance="outline" *ngIf="channel.value === 'SMS'">
                    <mat-label>Numero de telephone</mat-label>
                    <input matInput [(ngModel)]="preferences.phoneNumber" type="tel">
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiet Hours -->
        <div class="settings-card">
          <div class="card-header">
            <mat-icon>bedtime</mat-icon>
            <h2>Heures Calmes</h2>
          </div>
          <div class="settings-section">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Activer les heures calmes</span>
                <span class="setting-description">Ne pas envoyer de notifications pendant ces heures</span>
              </div>
              <mat-slide-toggle [(ngModel)]="preferences.quietHoursEnabled" color="primary"></mat-slide-toggle>
            </div>
            <div class="time-range" *ngIf="preferences.quietHoursEnabled">
              <mat-form-field appearance="outline">
                <mat-label>De</mat-label>
                <input matInput type="time" [(ngModel)]="preferences.quietHoursStart">
              </mat-form-field>
              <span class="time-separator">a</span>
              <mat-form-field appearance="outline">
                <mat-label>A</mat-label>
                <input matInput type="time" [(ngModel)]="preferences.quietHoursEnd">
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Digest -->
        <div class="settings-card">
          <div class="card-header">
            <mat-icon>summarize</mat-icon>
            <h2>Resume Periodique</h2>
          </div>
          <div class="settings-section">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Recevoir un resume</span>
                <span class="setting-description">Regrouper les notifications en un seul message</span>
              </div>
              <mat-slide-toggle [(ngModel)]="preferences.digestEnabled" color="primary"></mat-slide-toggle>
            </div>
            <div class="digest-config" *ngIf="preferences.digestEnabled">
              <mat-form-field appearance="outline">
                <mat-label>Frequence</mat-label>
                <mat-select [(ngModel)]="preferences.digestFrequency">
                  <mat-option value="HOURLY">Toutes les heures</mat-option>
                  <mat-option value="DAILY">Quotidien</mat-option>
                  <mat-option value="WEEKLY">Hebdomadaire</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" *ngIf="preferences.digestFrequency !== 'HOURLY'">
                <mat-label>Heure d'envoi</mat-label>
                <input matInput type="time" [(ngModel)]="preferences.digestTime">
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Notification Types -->
        <div class="settings-card full-width">
          <div class="card-header">
            <mat-icon>tune</mat-icon>
            <h2>Types de Notifications</h2>
          </div>
          <div class="settings-section">
            <div class="types-grid">
              <div class="type-category" *ngFor="let category of getCategories()">
                <h3>{{ category }}</h3>
                <div class="type-list">
                  <div class="type-item" *ngFor="let typeConfig of getTypesByCategory(category)">
                    <div class="type-header">
                      <mat-icon>{{ typeConfig.icon }}</mat-icon>
                      <div class="type-info">
                        <span class="type-label">{{ typeConfig.label }}</span>
                        <span class="type-description">{{ typeConfig.description }}</span>
                      </div>
                      <mat-slide-toggle
                        [checked]="isTypeEnabled(typeConfig.type)"
                        (change)="toggleType(typeConfig.type, $event.checked)"
                        color="primary">
                      </mat-slide-toggle>
                    </div>
                    <div class="type-channels" *ngIf="isTypeEnabled(typeConfig.type)">
                      <span class="channels-label">Canaux:</span>
                      <button *ngFor="let channel of availableChannels"
                              class="channel-chip"
                              [class.active]="isChannelEnabledForType(typeConfig.type, channel)"
                              (click)="toggleChannelForType(typeConfig.type, channel)">
                        <mat-icon>{{ getChannelIcon(channel) }}</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-icon class="spinning">sync</mat-icon>
        <p>Chargement des preferences...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 24px; margin-bottom: 8px; }
    .page-description { color: #757575; margin: 0; }
    .btn-primary {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 24px; background: #1a237e; color: white;
      border: none; border-radius: 8px; cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .settings-content {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .settings-card {
      background: white; border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .settings-card.full-width { grid-column: 1 / -1; }

    .card-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 24px; border-bottom: 1px solid #eee;
    }
    .card-header mat-icon { color: #1a237e; }
    .card-header h2 { font-size: 16px; margin: 0; }

    .settings-section { padding: 20px 24px; }

    .setting-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; border-bottom: 1px solid #f5f5f5;
    }
    .setting-row:last-child { border-bottom: none; }
    .setting-info { display: flex; flex-direction: column; }
    .setting-label { font-size: 14px; font-weight: 500; }
    .setting-description { font-size: 12px; color: #757575; margin-top: 4px; }

    .level-select { width: 150px; }
    ::ng-deep .level-select .mat-mdc-form-field-subscript-wrapper { display: none; }
    .level-option { display: flex; align-items: center; gap: 8px; }
    .level-info { color: #1565c0; }
    .level-success { color: #2e7d32; }
    .level-warning { color: #f57c00; }
    .level-error { color: #c62828; }
    .level-critical { color: #c2185b; }

    .channel-grid { display: flex; flex-direction: column; gap: 16px; }
    .channel-card {
      padding: 16px; background: #fafafa; border-radius: 8px;
    }
    .channel-header {
      display: flex; align-items: flex-start; gap: 12px;
    }
    .channel-header mat-icon { color: #1a237e; margin-top: 2px; }
    .channel-info { flex: 1; display: flex; flex-direction: column; }
    .channel-name { font-size: 14px; font-weight: 500; }
    .channel-description { font-size: 12px; color: #757575; }
    .channel-config { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; }
    .channel-config mat-form-field { width: 100%; }

    .time-range {
      display: flex; align-items: center; gap: 12px;
      margin-top: 16px;
    }
    .time-range mat-form-field { width: 120px; }
    .time-separator { color: #757575; }

    .digest-config {
      display: flex; gap: 16px; margin-top: 16px;
    }
    .digest-config mat-form-field { flex: 1; }

    .types-grid { display: flex; flex-direction: column; gap: 24px; }
    .type-category h3 {
      font-size: 14px; font-weight: 600; color: #1a237e;
      margin: 0 0 12px; padding-bottom: 8px;
      border-bottom: 2px solid #e8eaf6;
    }
    .type-list { display: flex; flex-direction: column; gap: 12px; }
    .type-item {
      padding: 12px 16px; background: #fafafa; border-radius: 8px;
    }
    .type-header {
      display: flex; align-items: flex-start; gap: 12px;
    }
    .type-header mat-icon { color: #757575; margin-top: 2px; }
    .type-info { flex: 1; display: flex; flex-direction: column; }
    .type-label { font-size: 13px; font-weight: 500; }
    .type-description { font-size: 11px; color: #757575; }
    .type-channels {
      display: flex; align-items: center; gap: 8px;
      margin-top: 12px; padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }
    .channels-label { font-size: 11px; color: #757575; }
    .channel-chip {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: #f5f5f5; border: 1px solid #e0e0e0;
      cursor: pointer; transition: all 0.2s;
    }
    .channel-chip mat-icon { font-size: 16px; width: 16px; height: 16px; color: #9e9e9e; }
    .channel-chip.active { background: #e8eaf6; border-color: #1a237e; }
    .channel-chip.active mat-icon { color: #1a237e; }
    .channel-chip:hover { background: #e0e0e0; }

    .loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 100px; color: #757575;
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .settings-content { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsNotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);

  preferences: NotificationPreferences | null = null;
  loading = true;
  saving = false;

  levels = [
    { value: NotificationLevel.INFO, label: 'Information', icon: 'info' },
    { value: NotificationLevel.SUCCESS, label: 'Succes', icon: 'check_circle' },
    { value: NotificationLevel.WARNING, label: 'Avertissement', icon: 'warning' },
    { value: NotificationLevel.ERROR, label: 'Erreur', icon: 'error' },
    { value: NotificationLevel.CRITICAL, label: 'Critique', icon: 'dangerous' }
  ];

  channels = [
    { value: NotificationChannel.IN_APP, label: 'Dans l\'application', description: 'Notifications dans le panneau', icon: 'web' },
    { value: NotificationChannel.EMAIL, label: 'Email', description: 'Recevoir par email', icon: 'email' },
    { value: NotificationChannel.SMS, label: 'SMS', description: 'Recevoir par SMS', icon: 'sms' },
    { value: NotificationChannel.PUSH, label: 'Push', description: 'Notifications push sur navigateur', icon: 'notification_important' }
  ];

  availableChannels = [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
    NotificationChannel.PUSH
  ];

  notificationTypes: NotificationTypeConfig[] = [
    // System
    { type: NotificationType.SYSTEM_ALERT, label: 'Alertes Systeme', description: 'Notifications importantes du systeme', category: 'Systeme', icon: 'warning' },
    { type: NotificationType.SYSTEM_UPDATE, label: 'Mises a jour', description: 'Nouvelles versions disponibles', category: 'Systeme', icon: 'system_update' },
    { type: NotificationType.MAINTENANCE, label: 'Maintenance', description: 'Maintenance planifiee', category: 'Systeme', icon: 'build' },
    // Tenant
    { type: NotificationType.TENANT_STATUS, label: 'Statut Instance', description: 'Changements de statut des instances', category: 'Instances', icon: 'apartment' },
    { type: NotificationType.TENANT_HEALTH, label: 'Sante Instance', description: 'Alertes de sante des instances', category: 'Instances', icon: 'favorite' },
    { type: NotificationType.TENANT_DEPLOYMENT, label: 'Deploiements', description: 'Progression des deploiements', category: 'Instances', icon: 'rocket_launch' },
    // Security
    { type: NotificationType.SECURITY_ALERT, label: 'Alertes Securite', description: 'Incidents de securite', category: 'Securite', icon: 'security' },
    { type: NotificationType.LOGIN_ATTEMPT, label: 'Tentatives Connexion', description: 'Connexions suspectes', category: 'Securite', icon: 'login' },
    { type: NotificationType.PERMISSION_CHANGE, label: 'Permissions', description: 'Changements de permissions', category: 'Securite', icon: 'admin_panel_settings' },
    // Performance
    { type: NotificationType.PERFORMANCE_ALERT, label: 'Performance', description: 'Alertes de performance', category: 'Performance', icon: 'speed' },
    { type: NotificationType.THRESHOLD_EXCEEDED, label: 'Seuils Depasses', description: 'Depassement de seuils configures', category: 'Performance', icon: 'trending_up' },
    { type: NotificationType.RESOURCE_WARNING, label: 'Ressources', description: 'Alertes de ressources', category: 'Performance', icon: 'memory' }
  ];

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loading = true;
    this.notificationService.getPreferences().subscribe({
      next: (prefs) => {
        this.preferences = prefs;
        this.loading = false;
      },
      error: () => {
        this.preferences = this.getDefaultPreferences();
        this.loading = false;
      }
    });
  }

  savePreferences(): void {
    if (!this.preferences) return;
    this.saving = true;
    this.notificationService.updatePreferences(this.preferences).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Preferences enregistrees', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }

  getCategories(): string[] {
    return [...new Set(this.notificationTypes.map(t => t.category))];
  }

  getTypesByCategory(category: string): NotificationTypeConfig[] {
    return this.notificationTypes.filter(t => t.category === category);
  }

  isTypeEnabled(type: NotificationType): boolean {
    return this.preferences?.typePreferences?.[type]?.enabled ?? true;
  }

  toggleType(type: NotificationType, enabled: boolean): void {
    if (!this.preferences) return;
    if (!this.preferences.typePreferences) {
      this.preferences.typePreferences = {};
    }
    if (!this.preferences.typePreferences[type]) {
      this.preferences.typePreferences[type] = {
        enabled: true,
        channels: [NotificationChannel.IN_APP]
      };
    }
    this.preferences.typePreferences[type]!.enabled = enabled;
  }

  isChannelEnabledForType(type: NotificationType, channel: NotificationChannel): boolean {
    return this.preferences?.typePreferences?.[type]?.channels?.includes(channel) ?? false;
  }

  toggleChannelForType(type: NotificationType, channel: NotificationChannel): void {
    if (!this.preferences) return;
    if (!this.preferences.typePreferences?.[type]) return;

    const channels = this.preferences.typePreferences[type]!.channels || [];
    const index = channels.indexOf(channel);
    if (index >= 0) {
      channels.splice(index, 1);
    } else {
      channels.push(channel);
    }
    this.preferences.typePreferences[type]!.channels = channels;
  }

  getChannelIcon(channel: NotificationChannel): string {
    const icons: Record<NotificationChannel, string> = {
      [NotificationChannel.IN_APP]: 'web',
      [NotificationChannel.EMAIL]: 'email',
      [NotificationChannel.SMS]: 'sms',
      [NotificationChannel.PUSH]: 'notification_important',
      [NotificationChannel.WEBHOOK]: 'webhook'
    };
    return icons[channel];
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      userId: '',
      enabled: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      channels: {
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.PUSH]: true,
        [NotificationChannel.WEBHOOK]: false
      },
      minimumLevel: NotificationLevel.INFO,
      typePreferences: {},
      digestEnabled: false,
      digestFrequency: 'DAILY',
      digestTime: '09:00'
    };
  }
}
