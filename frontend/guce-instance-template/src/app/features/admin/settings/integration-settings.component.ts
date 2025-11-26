import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-integration-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatExpansionModule, MatChipsModule
  ],
  template: `
    <div class="integration-settings">
      <div class="page-header">
        <h1>Configuration des intégrations</h1>
        <button mat-flat-button color="primary" (click)="saveAll()">
          <mat-icon>save</mat-icon> Enregistrer tout
        </button>
      </div>

      <mat-card class="overview-card">
        <div class="integrations-overview">
          <div class="integration-status" *ngFor="let int of integrations">
            <div class="status-indicator" [class]="int.status"></div>
            <span class="name">{{ int.name }}</span>
            <span class="status-text">{{ getStatusText(int.status) }}</span>
          </div>
        </div>
      </mat-card>

      <mat-accordion>
        <mat-expansion-panel *ngFor="let int of integrations">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>{{ int.icon }}</mat-icon>
              {{ int.name }}
            </mat-panel-title>
            <mat-panel-description>
              <mat-chip [class]="int.status">{{ getStatusText(int.status) }}</mat-chip>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="integration-config">
            <div class="config-header">
              <mat-slide-toggle [(ngModel)]="int.enabled">Activé</mat-slide-toggle>
              <button mat-stroked-button (click)="testConnection(int)">
                <mat-icon>wifi_tethering</mat-icon> Tester la connexion
              </button>
            </div>

            <div class="config-form" *ngIf="int.enabled">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de l'API</mat-label>
                <input matInput [(ngModel)]="int.config.apiUrl">
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Clé API / Client ID</mat-label>
                  <input matInput [(ngModel)]="int.config.apiKey">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Secret</mat-label>
                  <input matInput type="password" [(ngModel)]="int.config.apiSecret">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width" *ngIf="int.config.certificatePath !== undefined">
                <mat-label>Chemin du certificat</mat-label>
                <input matInput [(ngModel)]="int.config.certificatePath">
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Timeout (secondes)</mat-label>
                  <input matInput type="number" [(ngModel)]="int.config.timeout">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nombre de tentatives</mat-label>
                  <input matInput type="number" [(ngModel)]="int.config.retries">
                </mat-form-field>
              </div>

              <div class="webhook-config" *ngIf="int.webhookUrl !== undefined">
                <h4>Configuration Webhook</h4>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>URL du webhook (entrant)</mat-label>
                  <input matInput [value]="int.webhookUrl" readonly>
                  <button mat-icon-button matSuffix (click)="copyWebhook(int.webhookUrl)">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </mat-form-field>
              </div>
            </div>

            <div class="config-logs">
              <h4>Dernières opérations</h4>
              <div class="log-entries">
                <div class="log-entry" *ngFor="let log of int.recentLogs">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-status" [class]="log.status">{{ log.status }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>

      <mat-card class="api-keys-card">
        <h2>Clés API de l'instance</h2>
        <p class="hint">Clés pour permettre aux systèmes externes de s'intégrer à cette instance</p>

        <div class="api-key-list">
          <div class="api-key-item" *ngFor="let key of apiKeys">
            <div class="key-info">
              <span class="key-name">{{ key.name }}</span>
              <span class="key-scope">Scope: {{ key.scope }}</span>
            </div>
            <div class="key-value">
              <code>{{ key.masked }}</code>
              <button mat-icon-button (click)="copyKey(key.value)">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            <div class="key-actions">
              <button mat-icon-button color="warn" (click)="revokeKey(key)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <button mat-stroked-button (click)="generateNewKey()">
          <mat-icon>add</mat-icon> Générer une nouvelle clé
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .integration-settings { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .overview-card { padding: 24px; margin-bottom: 24px; .integrations-overview { display: flex; flex-wrap: wrap; gap: 24px; .integration-status { display: flex; align-items: center; gap: 8px; .status-indicator { width: 12px; height: 12px; border-radius: 50%; &.connected { background: #4caf50; } &.disconnected { background: #f44336; } &.degraded { background: #ff9800; } } .name { font-weight: 500; } .status-text { color: #757575; font-size: 12px; } } } }
    mat-expansion-panel { margin-bottom: 8px; mat-panel-title { display: flex; align-items: center; gap: 12px; mat-icon { color: #1976d2; } } mat-chip { &.connected { background: #e8f5e9; color: #2e7d32; } &.disconnected { background: #ffebee; color: #c62828; } &.degraded { background: #fff3e0; color: #ef6c00; } } }
    .integration-config { padding: 16px 0; .config-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; } .config-form { h4 { margin: 24px 0 12px; font-size: 14px; font-weight: 500; } } .config-logs { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0; h4 { margin: 0 0 12px; font-size: 14px; font-weight: 500; } .log-entries { font-family: monospace; font-size: 13px; .log-entry { display: flex; gap: 16px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; .log-time { color: #757575; min-width: 150px; } .log-status { min-width: 80px; font-weight: 500; &.success { color: #4caf50; } &.error { color: #f44336; } } .log-message { flex: 1; } } } } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .api-keys-card { padding: 24px; margin-top: 24px; h2 { margin: 0 0 8px; font-size: 18px; } .hint { color: #757575; margin: 0 0 24px; font-size: 14px; } .api-key-list { margin-bottom: 16px; .api-key-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 8px; .key-info { flex: 1; display: flex; flex-direction: column; .key-name { font-weight: 500; } .key-scope { font-size: 12px; color: #757575; } } .key-value { display: flex; align-items: center; gap: 8px; code { background: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 12px; } } } } }
  `]
})
export class IntegrationSettingsComponent {
  integrations = [
    {
      id: 'bank', name: 'Système Bancaire (BEAC)', icon: 'account_balance', status: 'connected', enabled: true,
      config: { apiUrl: 'https://api.beac.int/v2', apiKey: 'BEAC_CLIENT_123', apiSecret: '***', timeout: 30, retries: 3, certificatePath: '/etc/certs/beac.pem' },
      webhookUrl: 'https://guce.{{COUNTRY_DOMAIN}}/webhooks/bank',
      recentLogs: [
        { time: '10:30:15', status: 'success', message: 'Balance check for NIU M012345' },
        { time: '10:28:42', status: 'success', message: 'Payment notification received' },
        { time: '10:25:00', status: 'error', message: 'Connection timeout, retried successfully' }
      ]
    },
    {
      id: 'customs', name: 'SYDONIA (Douanes)', icon: 'local_shipping', status: 'connected', enabled: true,
      config: { apiUrl: 'https://sydonia.douanes.gov/api', apiKey: 'SYDONIA_KEY', apiSecret: '***', timeout: 60, retries: 3 },
      recentLogs: [
        { time: '10:32:00', status: 'success', message: 'Declaration DI-2024-00156 transmitted' },
        { time: '10:30:00', status: 'success', message: 'HS code validation completed' }
      ]
    },
    {
      id: 'port', name: 'Autorité Portuaire', icon: 'directions_boat', status: 'degraded', enabled: true,
      config: { apiUrl: 'https://api.port.cm/v1', apiKey: 'PORT_API_KEY', apiSecret: '***', timeout: 30, retries: 5 },
      recentLogs: [
        { time: '10:31:00', status: 'error', message: 'High latency detected (850ms)' },
        { time: '10:29:00', status: 'success', message: 'Container manifest received' }
      ]
    },
    {
      id: 'sms', name: 'Passerelle SMS', icon: 'sms', status: 'connected', enabled: true,
      config: { apiUrl: 'https://sms.provider.com/api', apiKey: 'SMS_KEY', apiSecret: '***', timeout: 10, retries: 2 },
      recentLogs: [
        { time: '10:30:00', status: 'success', message: '15 SMS sent' }
      ]
    }
  ];

  apiKeys = [
    { name: 'Production API Key', scope: 'read, write', value: 'guce_prod_abc123xyz', masked: 'guce_prod_***xyz' },
    { name: 'Test API Key', scope: 'read', value: 'guce_test_def456uvw', masked: 'guce_test_***uvw' }
  ];

  getStatusText(status: string): string {
    const texts: Record<string, string> = { connected: 'Connecté', disconnected: 'Déconnecté', degraded: 'Dégradé' };
    return texts[status] || status;
  }

  testConnection(integration: any): void {
    console.log('Testing connection:', integration.name);
  }

  copyWebhook(url: string): void {
    navigator.clipboard.writeText(url);
  }

  copyKey(key: string): void {
    navigator.clipboard.writeText(key);
  }

  revokeKey(key: any): void {
    console.log('Revoking key:', key.name);
  }

  generateNewKey(): void {
    console.log('Generating new API key');
  }

  saveAll(): void {
    console.log('Saving all integration settings');
  }
}
