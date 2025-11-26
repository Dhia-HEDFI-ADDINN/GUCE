import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'guce-service-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSlideToggleModule, MatSnackBarModule
  ],
  template: `
    <div class="settings-container">
      <h1>Paramètres du service</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Configuration du traitement</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="settingsForm" (ngSubmit)="save()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Délai standard de traitement (jours)</mat-label>
              <input matInput type="number" formControlName="standardDelay">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Délai prioritaire (jours)</mat-label>
              <input matInput type="number" formControlName="priorityDelay">
            </mat-form-field>

            <mat-slide-toggle formControlName="autoAssign" class="toggle-option">
              Attribution automatique des dossiers
            </mat-slide-toggle>

            <mat-slide-toggle formControlName="notifications" class="toggle-option">
              Notifications par email
            </mat-slide-toggle>

            <mat-slide-toggle formControlName="escalation" class="toggle-option">
              Escalade automatique des retards
            </mat-slide-toggle>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit">
                Enregistrer
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
      max-width: 600px;

      h1 { margin: 0 0 24px; font-size: 24px; }
    }

    .full-width { width: 100%; margin-bottom: 16px; }
    .toggle-option { display: block; margin-bottom: 16px; }
    .form-actions { margin-top: 24px; }
  `]
})
export class ServiceSettingsComponent {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.settingsForm = this.fb.group({
      standardDelay: [5],
      priorityDelay: [2],
      autoAssign: [true],
      notifications: [true],
      escalation: [true]
    });
  }

  save() {
    this.snackBar.open('Paramètres enregistrés', 'Fermer', { duration: 3000 });
  }
}
