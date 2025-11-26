import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'guce-client-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="client-form-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/e-business/clients"><mat-icon>arrow_back</mat-icon></button>
        <h1>Nouveau client</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>N° Contribuable</mat-label>
                <input matInput formControlName="taxNumber">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Raison sociale</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contact principal</mat-label>
                <input matInput formControlName="contact">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Adresse</mat-label>
                <textarea matInput formControlName="address" rows="2"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/e-business/clients">Annuler</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="!form.valid">Enregistrer</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .client-form-container { padding: 24px; max-width: 800px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; .full-width { grid-column: 1 / -1; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class ClientFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    taxNumber: ['', Validators.required],
    name: ['', Validators.required],
    contact: [''],
    email: ['', Validators.email],
    phone: [''],
    address: ['']
  });

  save() {
    this.snackBar.open('Client créé', 'Fermer', { duration: 3000 });
    this.router.navigate(['/e-business/clients']);
  }
}
