import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'guce-general-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatDividerModule, MatTabsModule
  ],
  template: `
    <div class="general-settings">
      <div class="page-header">
        <h1>Paramètres de l'instance</h1>
        <button mat-flat-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="Général">
          <div class="tab-content">
            <mat-card class="settings-card">
              <h2>Informations de l'instance</h2>

              <form [formGroup]="generalForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom de l'instance</mat-label>
                  <input matInput formControlName="instanceName">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Code pays</mat-label>
                  <input matInput formControlName="countryCode" maxlength="2">
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Fuseau horaire</mat-label>
                    <mat-select formControlName="timezone">
                      <mat-option value="Africa/Douala">Africa/Douala (UTC+1)</mat-option>
                      <mat-option value="Africa/Lagos">Africa/Lagos (UTC+1)</mat-option>
                      <mat-option value="Europe/Paris">Europe/Paris (UTC+1/2)</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Langue par défaut</mat-label>
                    <mat-select formControlName="defaultLanguage">
                      <mat-option value="fr">Français</mat-option>
                      <mat-option value="en">English</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Devise</mat-label>
                    <mat-select formControlName="currency">
                      <mat-option value="XAF">XAF - Franc CFA</mat-option>
                      <mat-option value="XOF">XOF - Franc CFA BCEAO</mat-option>
                      <mat-option value="EUR">EUR - Euro</mat-option>
                      <mat-option value="USD">USD - Dollar US</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Format de date</mat-label>
                    <mat-select formControlName="dateFormat">
                      <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                      <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                      <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </form>
            </mat-card>

            <mat-card class="settings-card">
              <h2>Contact administratif</h2>

              <form [formGroup]="contactForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email de support</mat-label>
                  <input matInput type="email" formControlName="supportEmail">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Téléphone de support</mat-label>
                  <input matInput formControlName="supportPhone">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Adresse</mat-label>
                  <textarea matInput formControlName="address" rows="2"></textarea>
                </mat-form-field>
              </form>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Sécurité">
          <div class="tab-content">
            <mat-card class="settings-card">
              <h2>Authentification</h2>

              <form [formGroup]="securityForm">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Authentification à deux facteurs</span>
                    <span class="toggle-desc">Exiger 2FA pour tous les utilisateurs</span>
                  </div>
                  <mat-slide-toggle formControlName="requireMfa"></mat-slide-toggle>
                </div>

                <mat-divider></mat-divider>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Validation email obligatoire</span>
                    <span class="toggle-desc">Les utilisateurs doivent valider leur email</span>
                  </div>
                  <mat-slide-toggle formControlName="requireEmailVerification"></mat-slide-toggle>
                </div>

                <mat-divider></mat-divider>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Expiration de session (minutes)</mat-label>
                    <input matInput type="number" formControlName="sessionTimeout">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Tentatives de connexion max</mat-label>
                    <input matInput type="number" formControlName="maxLoginAttempts">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Durée de blocage après échecs (minutes)</mat-label>
                  <input matInput type="number" formControlName="lockoutDuration">
                </mat-form-field>
              </form>
            </mat-card>

            <mat-card class="settings-card">
              <h2>Politique de mot de passe</h2>

              <form [formGroup]="passwordForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Longueur minimale</mat-label>
                  <input matInput type="number" formControlName="minLength">
                </mat-form-field>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Exiger des majuscules</span>
                  </div>
                  <mat-slide-toggle formControlName="requireUppercase"></mat-slide-toggle>
                </div>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Exiger des chiffres</span>
                  </div>
                  <mat-slide-toggle formControlName="requireNumbers"></mat-slide-toggle>
                </div>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Exiger des caractères spéciaux</span>
                  </div>
                  <mat-slide-toggle formControlName="requireSpecialChars"></mat-slide-toggle>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Expiration du mot de passe (jours, 0 = jamais)</mat-label>
                  <input matInput type="number" formControlName="passwordExpiry">
                </mat-form-field>
              </form>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Notifications">
          <div class="tab-content">
            <mat-card class="settings-card">
              <h2>Canaux de notification</h2>

              <form [formGroup]="notificationForm">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Notifications par email</span>
                    <span class="toggle-desc">Envoyer les notifications importantes par email</span>
                  </div>
                  <mat-slide-toggle formControlName="emailEnabled"></mat-slide-toggle>
                </div>

                <mat-divider></mat-divider>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Notifications SMS</span>
                    <span class="toggle-desc">Alertes critiques par SMS</span>
                  </div>
                  <mat-slide-toggle formControlName="smsEnabled"></mat-slide-toggle>
                </div>

                <mat-divider></mat-divider>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Notifications push</span>
                    <span class="toggle-desc">Notifications dans le navigateur</span>
                  </div>
                  <mat-slide-toggle formControlName="pushEnabled"></mat-slide-toggle>
                </div>
              </form>
            </mat-card>

            <mat-card class="settings-card">
              <h2>Configuration SMTP</h2>

              <form [formGroup]="smtpForm">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Serveur SMTP</mat-label>
                    <input matInput formControlName="smtpHost">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Port</mat-label>
                    <input matInput type="number" formControlName="smtpPort">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Utilisateur</mat-label>
                    <input matInput formControlName="smtpUser">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Mot de passe</mat-label>
                    <input matInput type="password" formControlName="smtpPassword">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email expéditeur</mat-label>
                  <input matInput type="email" formControlName="fromEmail">
                </mat-form-field>

                <button mat-stroked-button type="button">
                  <mat-icon>send</mat-icon> Tester la configuration
                </button>
              </form>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .general-settings { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .tab-content { padding: 24px 0; }
    .settings-card { padding: 24px; margin-bottom: 24px; h2 { margin: 0 0 24px; font-size: 18px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; .toggle-info { .toggle-label { display: block; font-weight: 500; } .toggle-desc { font-size: 12px; color: #757575; } } }
    mat-divider { margin: 8px 0; }
  `]
})
export class GeneralSettingsComponent {
  private fb = inject(FormBuilder);

  generalForm: FormGroup;
  contactForm: FormGroup;
  securityForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;
  smtpForm: FormGroup;

  constructor() {
    this.generalForm = this.fb.group({
      instanceName: ['GUCE {{COUNTRY_NAME}}'],
      countryCode: ['{{COUNTRY_CODE}}'],
      timezone: ['Africa/Douala'],
      defaultLanguage: ['fr'],
      currency: ['XAF'],
      dateFormat: ['DD/MM/YYYY']
    });

    this.contactForm = this.fb.group({
      supportEmail: ['support@guce.{{COUNTRY_DOMAIN}}'],
      supportPhone: ['+237 XXX XXX XXX'],
      address: ['']
    });

    this.securityForm = this.fb.group({
      requireMfa: [false],
      requireEmailVerification: [true],
      sessionTimeout: [30],
      maxLoginAttempts: [5],
      lockoutDuration: [15]
    });

    this.passwordForm = this.fb.group({
      minLength: [8],
      requireUppercase: [true],
      requireNumbers: [true],
      requireSpecialChars: [true],
      passwordExpiry: [90]
    });

    this.notificationForm = this.fb.group({
      emailEnabled: [true],
      smsEnabled: [false],
      pushEnabled: [true]
    });

    this.smtpForm = this.fb.group({
      smtpHost: ['smtp.example.com'],
      smtpPort: [587],
      smtpUser: [''],
      smtpPassword: [''],
      fromEmail: ['noreply@guce.{{COUNTRY_DOMAIN}}']
    });
  }

  saveSettings(): void {
    console.log('Saving settings...');
  }
}
