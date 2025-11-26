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

@Component({
  selector: 'guce-role-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatCheckboxModule
  ],
  template: `
    <div class="role-form">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/roles">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEdit ? 'Modifier le rôle' : 'Nouveau rôle' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card class="form-card">
          <h2>Informations du rôle</h2>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom du rôle</mat-label>
            <input matInput formControlName="name" placeholder="Ex: Validateur Commercial">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Nom requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"
                      placeholder="Description des responsabilités de ce rôle"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Icône</mat-label>
              <mat-select formControlName="icon">
                <mat-option *ngFor="let icon of icons" [value]="icon">
                  <mat-icon>{{ icon }}</mat-icon> {{ icon }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Couleur</mat-label>
              <mat-select formControlName="color">
                <mat-option *ngFor="let color of colors" [value]="color.value">
                  <span class="color-preview" [style.background]="color.value"></span>
                  {{ color.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Portails autorisés</mat-label>
            <mat-select formControlName="scopes" multiple>
              <mat-option value="e-Force">e-Force (Opérateurs)</mat-option>
              <mat-option value="e-Gov">e-Gov (Administrations)</mat-option>
              <mat-option value="e-Business">e-Business (Intermédiaires)</mat-option>
              <mat-option value="Admin">Administration</mat-option>
              <mat-option value="Config">Configuration</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card>

        <mat-card class="form-card">
          <h2>Modèle de base</h2>
          <p class="hint">Optionnel: sélectionnez un rôle existant pour copier ses permissions</p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Copier les permissions de</mat-label>
            <mat-select formControlName="templateRole">
              <mat-option value="">Aucun (partir de zéro)</mat-option>
              <mat-option *ngFor="let role of existingRoles" [value]="role.id">{{ role.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card>

        <mat-card class="form-card">
          <h2>Options avancées</h2>

          <div class="checkbox-group">
            <mat-checkbox formControlName="canDelegate">
              Peut déléguer ses permissions à d'autres utilisateurs
            </mat-checkbox>
            <mat-checkbox formControlName="requireMfa">
              Authentification à deux facteurs obligatoire
            </mat-checkbox>
            <mat-checkbox formControlName="sessionLimit">
              Limiter à une session active par utilisateur
            </mat-checkbox>
          </div>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" routerLink="/admin/roles">Annuler</button>
          <button mat-stroked-button type="button" *ngIf="!isEdit" (click)="saveAndConfigure()">
            Enregistrer et configurer les permissions
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? 'Enregistrer' : 'Créer le rôle' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .role-form { padding: 24px; max-width: 800px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .form-card { padding: 24px; margin-bottom: 24px; h2 { margin: 0 0 16px; font-size: 18px; } .hint { color: #757575; margin: -8px 0 16px; font-size: 14px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .color-preview { display: inline-block; width: 16px; height: 16px; border-radius: 4px; margin-right: 8px; vertical-align: middle; }
    .checkbox-group { display: flex; flex-direction: column; gap: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
  `]
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  isEdit = false;
  form!: FormGroup;

  icons = ['verified_user', 'assignment_ind', 'business_center', 'local_shipping', 'supervisor_account', 'support_agent', 'manage_accounts', 'shield'];

  colors = [
    { name: 'Bleu', value: '#1976d2' },
    { name: 'Vert', value: '#4caf50' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Violet', value: '#9c27b0' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'Gris', value: '#607d8b' },
    { name: 'Rouge', value: '#f44336' }
  ];

  existingRoles = [
    { id: '1', name: 'Administrateur' },
    { id: '2', name: 'Opérateur Économique' },
    { id: '3', name: 'Validateur Douanes' }
  ];

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.params['id'] !== undefined;

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      icon: ['verified_user'],
      color: ['#1976d2'],
      scopes: [[]],
      templateRole: [''],
      canDelegate: [false],
      requireMfa: [false],
      sessionLimit: [false]
    });

    if (this.isEdit) {
      this.loadRole();
    }
  }

  loadRole(): void {
    this.form.patchValue({
      name: 'Agent MINCOMMERCE',
      description: 'Traitement des demandes commerciales',
      icon: 'assignment_ind',
      color: '#9c27b0',
      scopes: ['e-Gov'],
      canDelegate: false,
      requireMfa: false,
      sessionLimit: false
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Role form submitted:', this.form.value);
    }
  }

  saveAndConfigure(): void {
    if (this.form.valid) {
      console.log('Save and redirect to permissions');
    }
  }
}
