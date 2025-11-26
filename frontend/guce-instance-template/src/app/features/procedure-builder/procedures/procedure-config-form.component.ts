import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'guce-procedure-config-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="form-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/config/procedures/list"><mat-icon>arrow_back</mat-icon></button>
        <h1>Configuration procédure</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Catégorie</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="import">Import</mat-option>
                  <mat-option value="export">Export</mat-option>
                  <mat-option value="transit">Transit</mat-option>
                  <mat-option value="certificate">Certificat</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Délai standard (jours)</mat-label>
                <input matInput type="number" formControlName="standardDelay">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/config/procedures/list">Annuler</button>
              <button mat-flat-button color="primary" type="submit">Enregistrer</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; max-width: 800px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; .full-width { grid-column: 1 / -1; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class ProcedureConfigFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    category: ['', Validators.required],
    standardDelay: [5],
    description: ['']
  });

  save() {
    this.snackBar.open('Procédure enregistrée', 'Fermer', { duration: 3000 });
    this.router.navigate(['/config/procedures/list']);
  }
}
