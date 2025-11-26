import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'guce-notification-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatCheckboxModule, MatDividerModule
  ],
  template: `
    <div class="notification-settings">
      <div class="page-header">
        <h1>Configuration des notifications</h1>
        <button mat-flat-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </div>

      <mat-card class="settings-card">
        <h2>Modèles de notification</h2>
        <p class="hint">Configurez les modèles d'emails et SMS envoyés automatiquement</p>

        <div class="template-list">
          <div class="template-item" *ngFor="let template of templates">
            <div class="template-info">
              <mat-icon>{{ template.icon }}</mat-icon>
              <div class="template-details">
                <span class="template-name">{{ template.name }}</span>
                <span class="template-trigger">Déclenché par: {{ template.trigger }}</span>
              </div>
            </div>
            <div class="template-channels">
              <mat-checkbox [checked]="template.email">Email</mat-checkbox>
              <mat-checkbox [checked]="template.sms">SMS</mat-checkbox>
              <mat-checkbox [checked]="template.push">Push</mat-checkbox>
            </div>
            <button mat-icon-button (click)="editTemplate(template)">
              <mat-icon>edit</mat-icon>
            </button>
          </div>
        </div>
      </mat-card>

      <mat-card class="settings-card">
        <h2>Rappels automatiques</h2>

        <div class="reminder-settings">
          <div class="reminder-row">
            <div class="reminder-info">
              <span class="reminder-name">Rappel de paiement en attente</span>
              <span class="reminder-desc">Envoyer un rappel pour les paiements non effectués</span>
            </div>
            <mat-slide-toggle [checked]="reminders.pendingPayment"></mat-slide-toggle>
            <mat-form-field appearance="outline" class="delay-field">
              <mat-label>Après</mat-label>
              <mat-select [(value)]="reminders.pendingPaymentDelay">
                <mat-option value="1">1 jour</mat-option>
                <mat-option value="3">3 jours</mat-option>
                <mat-option value="7">7 jours</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider></mat-divider>

          <div class="reminder-row">
            <div class="reminder-info">
              <span class="reminder-name">Rappel de documents manquants</span>
              <span class="reminder-desc">Relancer pour les documents non téléversés</span>
            </div>
            <mat-slide-toggle [checked]="reminders.missingDocs"></mat-slide-toggle>
            <mat-form-field appearance="outline" class="delay-field">
              <mat-label>Après</mat-label>
              <mat-select [(value)]="reminders.missingDocsDelay">
                <mat-option value="1">1 jour</mat-option>
                <mat-option value="2">2 jours</mat-option>
                <mat-option value="5">5 jours</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider></mat-divider>

          <div class="reminder-row">
            <div class="reminder-info">
              <span class="reminder-name">Alerte d'expiration de document</span>
              <span class="reminder-desc">Notifier avant l'expiration des documents</span>
            </div>
            <mat-slide-toggle [checked]="reminders.docExpiry"></mat-slide-toggle>
            <mat-form-field appearance="outline" class="delay-field">
              <mat-label>Avant</mat-label>
              <mat-select [(value)]="reminders.docExpiryDelay">
                <mat-option value="7">7 jours</mat-option>
                <mat-option value="15">15 jours</mat-option>
                <mat-option value="30">30 jours</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-card>

      <mat-card class="settings-card">
        <h2>Alertes administrateurs</h2>

        <div class="alert-settings">
          <div class="alert-row">
            <mat-checkbox [(ngModel)]="alerts.systemErrors">Erreurs système critiques</mat-checkbox>
          </div>
          <div class="alert-row">
            <mat-checkbox [(ngModel)]="alerts.securityEvents">Événements de sécurité suspects</mat-checkbox>
          </div>
          <div class="alert-row">
            <mat-checkbox [(ngModel)]="alerts.lowResources">Ressources système faibles</mat-checkbox>
          </div>
          <div class="alert-row">
            <mat-checkbox [(ngModel)]="alerts.dailyReport">Rapport quotidien d'activité</mat-checkbox>
          </div>
        </div>

        <mat-divider></mat-divider>

        <h3>Destinataires des alertes</h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Emails (séparés par des virgules)</mat-label>
          <input matInput [(ngModel)]="alertEmails">
        </mat-form-field>
      </mat-card>

      <mat-card class="settings-card">
        <h2>Heures de silence</h2>
        <p class="hint">Période pendant laquelle les notifications non urgentes ne sont pas envoyées</p>

        <div class="quiet-hours">
          <mat-slide-toggle [(ngModel)]="quietHours.enabled">Activer les heures de silence</mat-slide-toggle>

          <div class="time-range" *ngIf="quietHours.enabled">
            <mat-form-field appearance="outline">
              <mat-label>De</mat-label>
              <input matInput type="time" [(ngModel)]="quietHours.start">
            </mat-form-field>
            <span>à</span>
            <mat-form-field appearance="outline">
              <mat-label>À</mat-label>
              <input matInput type="time" [(ngModel)]="quietHours.end">
            </mat-form-field>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .notification-settings { padding: 24px; max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .settings-card { padding: 24px; margin-bottom: 24px; h2 { margin: 0 0 8px; font-size: 18px; } h3 { margin: 24px 0 16px; font-size: 16px; } .hint { color: #757575; margin: 0 0 24px; font-size: 14px; } }
    .template-list { .template-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; } .template-info { display: flex; align-items: center; gap: 12px; flex: 1; mat-icon { color: #1976d2; } .template-details { display: flex; flex-direction: column; .template-name { font-weight: 500; } .template-trigger { font-size: 12px; color: #757575; } } } .template-channels { display: flex; gap: 16px; } } }
    .reminder-settings { .reminder-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; .reminder-info { flex: 1; display: flex; flex-direction: column; .reminder-name { font-weight: 500; } .reminder-desc { font-size: 12px; color: #757575; } } .delay-field { width: 120px; } } }
    .alert-settings { .alert-row { padding: 8px 0; } }
    .quiet-hours { .time-range { display: flex; align-items: center; gap: 16px; margin-top: 16px; mat-form-field { width: 150px; } span { color: #757575; } } }
    .full-width { width: 100%; }
    mat-divider { margin: 16px 0; }
  `]
})
export class NotificationSettingsComponent {
  templates = [
    { id: 1, icon: 'description', name: 'Confirmation de soumission', trigger: 'Soumission déclaration', email: true, sms: false, push: true },
    { id: 2, icon: 'check_circle', name: 'Approbation de déclaration', trigger: 'Validation finale', email: true, sms: true, push: true },
    { id: 3, icon: 'cancel', name: 'Rejet de déclaration', trigger: 'Rejet par administration', email: true, sms: true, push: true },
    { id: 4, icon: 'payment', name: 'Confirmation de paiement', trigger: 'Paiement réussi', email: true, sms: false, push: true },
    { id: 5, icon: 'person_add', name: 'Bienvenue nouvel utilisateur', trigger: 'Création de compte', email: true, sms: false, push: false },
    { id: 6, icon: 'lock_reset', name: 'Réinitialisation mot de passe', trigger: 'Demande de réinitialisation', email: true, sms: false, push: false }
  ];

  reminders = {
    pendingPayment: true,
    pendingPaymentDelay: '3',
    missingDocs: true,
    missingDocsDelay: '2',
    docExpiry: true,
    docExpiryDelay: '30'
  };

  alerts = {
    systemErrors: true,
    securityEvents: true,
    lowResources: true,
    dailyReport: false
  };

  alertEmails = 'admin@guce.gov, tech@guce.gov';

  quietHours = {
    enabled: true,
    start: '22:00',
    end: '07:00'
  };

  editTemplate(template: any): void {
    console.log('Edit template:', template);
  }

  saveSettings(): void {
    console.log('Saving notification settings...');
  }
}
