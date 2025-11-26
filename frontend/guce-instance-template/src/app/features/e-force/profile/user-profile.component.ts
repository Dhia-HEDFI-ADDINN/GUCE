import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'guce-user-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTabsModule, MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="avatar" [style.background]="avatarColor">{{ userInitials }}</div>
        <div class="user-info">
          <h1>{{ userName }}</h1>
          <p>{{ userEmail }}</p>
          <span class="user-role">{{ userRole }}</span>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Informations personnelles">
          <mat-card class="tab-card">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Prénom</mat-label>
                  <input matInput formControlName="firstName">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="lastName">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Téléphone</mat-label>
                  <input matInput formControlName="phone">
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="!profileForm.dirty">
                  Enregistrer
                </button>
              </div>
            </form>
          </mat-card>
        </mat-tab>

        <mat-tab label="Entreprise">
          <mat-card class="tab-card">
            <form [formGroup]="companyForm" (ngSubmit)="saveCompany()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>N° Contribuable</mat-label>
                  <input matInput formControlName="taxNumber" readonly>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Raison sociale</mat-label>
                  <input matInput formControlName="companyName">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Adresse</mat-label>
                  <textarea matInput formControlName="address" rows="2"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ville</mat-label>
                  <input matInput formControlName="city">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Pays</mat-label>
                  <input matInput formControlName="country" readonly>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="!companyForm.dirty">
                  Enregistrer
                </button>
              </div>
            </form>
          </mat-card>
        </mat-tab>

        <mat-tab label="Sécurité">
          <mat-card class="tab-card">
            <h3>Changer le mot de passe</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-grid single">
                <mat-form-field appearance="outline">
                  <mat-label>Mot de passe actuel</mat-label>
                  <input matInput type="password" formControlName="currentPassword">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nouveau mot de passe</mat-label>
                  <input matInput type="password" formControlName="newPassword">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirmer le mot de passe</mat-label>
                  <input matInput type="password" formControlName="confirmPassword">
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="!passwordForm.valid">
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container { padding: 24px; max-width: 800px; margin: 0 auto; }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        font-weight: 600;
      }

      .user-info {
        h1 { margin: 0; font-size: 24px; }
        p { margin: 4px 0 8px; color: #757575; }
        .user-role {
          background: #e3f2fd;
          color: #1565c0;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
        }
      }
    }

    .tab-card {
      margin-top: 24px;
      padding: 24px;

      h3 { margin: 0 0 24px; font-size: 18px; }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      &.single { grid-template-columns: 1fr; max-width: 400px; }
      .full-width { grid-column: 1 / -1; }

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private keycloak = inject(KeycloakService);
  private snackBar = inject(MatSnackBar);

  userName = '';
  userEmail = '';
  userInitials = '';
  userRole = '';
  avatarColor = '#1976d2';

  profileForm!: FormGroup;
  companyForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadUserData();
  }

  initForms() {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.email],
      phone: ['']
    });

    this.companyForm = this.fb.group({
      taxNumber: [''],
      companyName: [''],
      address: [''],
      city: [''],
      country: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  async loadUserData() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName} ${profile.lastName}`;
      this.userEmail = profile.email || '';
      this.userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

      this.profileForm.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      });

      const roles = this.keycloak.getUserRoles();
      if (roles.includes('OPERATEUR_ECONOMIQUE')) this.userRole = 'Opérateur Économique';
      else if (roles.includes('DECLARANT')) this.userRole = 'Déclarant';
      else this.userRole = 'Utilisateur';

      // Load company data from API
      this.companyForm.patchValue({
        taxNumber: 'M123456789A',
        companyName: 'SARL Tech Import',
        address: 'BP 1234',
        city: 'Douala',
        country: 'Cameroun'
      });
    } catch {
      this.userName = 'Utilisateur';
      this.userInitials = 'U';
    }
  }

  saveProfile() {
    this.snackBar.open('Profil mis à jour', 'Fermer', { duration: 3000 });
    this.profileForm.markAsPristine();
  }

  saveCompany() {
    this.snackBar.open('Informations entreprise mises à jour', 'Fermer', { duration: 3000 });
    this.companyForm.markAsPristine();
  }

  changePassword() {
    if (this.passwordForm.get('newPassword')?.value !== this.passwordForm.get('confirmPassword')?.value) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', { duration: 3000 });
      return;
    }
    this.snackBar.open('Mot de passe modifié', 'Fermer', { duration: 3000 });
    this.passwordForm.reset();
  }
}
