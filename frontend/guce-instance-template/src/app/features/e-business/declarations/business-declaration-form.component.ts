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
  selector: 'guce-business-declaration-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="form-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/e-business/declarations"><mat-icon>arrow_back</mat-icon></button>
        <h1>Nouvelle déclaration pour client</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Client</mat-label>
              <mat-select formControlName="clientId">
                <mat-option *ngFor="let c of clients" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type de déclaration</mat-label>
              <mat-select formControlName="type">
                <mat-option value="import">Import</mat-option>
                <mat-option value="export">Export</mat-option>
                <mat-option value="transit">Transit</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/e-business/declarations">Annuler</button>
              <button mat-flat-button color="primary" type="submit">Créer et continuer</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; max-width: 600px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class BusinessDeclarationFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  clients = [
    { id: '1', name: 'SARL Tech Import' },
    { id: '2', name: 'Agro Export SA' },
    { id: '3', name: 'Auto Parts SARL' }
  ];

  form = this.fb.group({
    clientId: ['', Validators.required],
    type: ['import', Validators.required]
  });

  submit() {
    this.snackBar.open('Déclaration créée', 'Fermer', { duration: 3000 });
    this.router.navigate(['/e-force/declarations/new', this.form.get('type')?.value]);
  }
}
