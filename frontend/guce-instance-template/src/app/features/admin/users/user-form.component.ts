import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'guce-user-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatDividerModule
  ],
  template: `
    <div class="user-form">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/users">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card class="form-card">
          <h2>Informations personnelles</h2>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName">
              <mat-error *ngIf="form.get('firstName')?.hasError('required')">Prénom requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName">
              <mat-error *ngIf="form.get('lastName')?.hasError('required')">Nom requis</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Langue</mat-label>
              <mat-select formControlName="language">
                <mat-option value="fr">Français</mat-option>
                <mat-option value="en">English</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <mat-card class="form-card">
          <h2>Organisation & Rôle</h2>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Organisation</mat-label>
            <mat-select formControlName="organizationId">
              <mat-option *ngFor="let org of organizations" [value]="org.id">{{ org.name }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('organizationId')?.hasError('required')">Organisation requise</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="roleId">
              <mat-option *ngFor="let role of roles" [value]="role.id">{{ role.name }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('roleId')?.hasError('required')">Rôle requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fonction</mat-label>
            <input matInput formControlName="jobTitle" placeholder="Ex: Responsable Import">
          </mat-form-field>
        </mat-card>

        <mat-card class="form-card">
          <h2>Paramètres du compte</h2>

          <div class="checkbox-group">
            <mat-checkbox formControlName="active">Compte actif</mat-checkbox>
            <mat-checkbox formControlName="emailVerified">Email vérifié</mat-checkbox>
            <mat-checkbox formControlName="twoFactorEnabled">Authentification à deux facteurs</mat-checkbox>
          </div>

          <mat-divider></mat-divider>

          <div class="password-section" *ngIf="!isEdit">
            <h3>Mot de passe initial</h3>
            <div class="password-options">
              <mat-checkbox formControlName="generatePassword">Générer un mot de passe automatique</mat-checkbox>
            </div>

            <div class="form-row" *ngIf="!form.get('generatePassword')?.value">
              <mat-form-field appearance="outline">
                <mat-label>Mot de passe</mat-label>
                <input matInput type="password" formControlName="password">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirmer</mat-label>
                <input matInput type="password" formControlName="confirmPassword">
              </mat-form-field>
            </div>

            <mat-checkbox formControlName="forcePasswordChange">
              Forcer le changement de mot de passe à la première connexion
            </mat-checkbox>
          </div>

          <div class="notification-options">
            <h3>Notifications</h3>
            <mat-checkbox formControlName="sendWelcomeEmail">Envoyer un email de bienvenue</mat-checkbox>
          </div>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" routerLink="/admin/users">Annuler</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? 'Enregistrer' : 'Créer l\'utilisateur' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .user-form { padding: 24px; max-width: 800px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .form-card { padding: 24px; margin-bottom: 24px; h2 { margin: 0 0 24px; font-size: 18px; } h3 { margin: 16px 0 12px; font-size: 14px; font-weight: 500; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .checkbox-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    mat-divider { margin: 24px 0; }
    .password-section { margin-top: 16px; .password-options { margin-bottom: 16px; } }
    .notification-options { margin-top: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  isEdit = false;
  form!: FormGroup;

  organizations = [
    { id: '1', name: 'Import Export SARL' },
    { id: '2', name: 'Direction des Douanes' },
    { id: '3', name: 'Transit Pro' },
    { id: '4', name: 'Commerce Global' },
    { id: '5', name: 'GUCE Administration' }
  ];

  roles = [
    { id: '1', name: 'Administrateur' },
    { id: '2', name: 'Opérateur Économique' },
    { id: '3', name: 'Validateur' },
    { id: '4', name: 'Agent' },
    { id: '5', name: 'Superviseur' }
  ];

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.params['id'] !== undefined;

    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      language: ['fr'],
      organizationId: ['', Validators.required],
      roleId: ['', Validators.required],
      jobTitle: [''],
      active: [true],
      emailVerified: [false],
      twoFactorEnabled: [false],
      generatePassword: [true],
      password: [''],
      confirmPassword: [''],
      forcePasswordChange: [true],
      sendWelcomeEmail: [true]
    });

    if (this.isEdit) {
      this.loadUser();
    }
  }

  loadUser(): void {
    // Mock data for editing
    this.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+237 612 345 678',
      language: 'fr',
      organizationId: '1',
      roleId: '2',
      jobTitle: 'Responsable Import',
      active: true,
      emailVerified: true,
      twoFactorEnabled: false
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('User form submitted:', this.form.value);
      // Navigate back after save
    }
  }
}
