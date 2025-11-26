import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'guce-branding-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule
  ],
  template: `
    <div class="branding-settings">
      <div class="page-header">
        <h1>Personnalisation visuelle</h1>
        <button mat-flat-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </div>

      <div class="settings-grid">
        <mat-card class="settings-card">
          <h2>Logos</h2>

          <div class="upload-section">
            <label>Logo principal</label>
            <div class="upload-zone" (click)="logoInput.click()">
              <input #logoInput type="file" hidden accept="image/*">
              <img *ngIf="currentLogo" [src]="currentLogo" alt="Logo">
              <div class="upload-placeholder" *ngIf="!currentLogo">
                <mat-icon>cloud_upload</mat-icon>
                <span>Cliquez pour téléverser</span>
                <span class="hint">PNG, SVG (max 2MB)</span>
              </div>
            </div>
          </div>

          <div class="upload-section">
            <label>Favicon</label>
            <div class="upload-zone small" (click)="faviconInput.click()">
              <input #faviconInput type="file" hidden accept="image/*">
              <img *ngIf="currentFavicon" [src]="currentFavicon" alt="Favicon">
              <div class="upload-placeholder" *ngIf="!currentFavicon">
                <mat-icon>add_photo_alternate</mat-icon>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="settings-card">
          <h2>Couleurs</h2>

          <form [formGroup]="colorsForm">
            <div class="color-field">
              <label>Couleur principale</label>
              <div class="color-input">
                <input type="color" formControlName="primaryColor">
                <input matInput formControlName="primaryColor">
              </div>
            </div>

            <div class="color-field">
              <label>Couleur secondaire</label>
              <div class="color-input">
                <input type="color" formControlName="secondaryColor">
                <input matInput formControlName="secondaryColor">
              </div>
            </div>

            <div class="color-field">
              <label>Couleur d'accent</label>
              <div class="color-input">
                <input type="color" formControlName="accentColor">
                <input matInput formControlName="accentColor">
              </div>
            </div>

            <div class="color-field">
              <label>Couleur de la sidebar</label>
              <div class="color-input">
                <input type="color" formControlName="sidebarColor">
                <input matInput formControlName="sidebarColor">
              </div>
            </div>
          </form>
        </mat-card>
      </div>

      <mat-card class="preview-card">
        <h2>Aperçu</h2>
        <div class="preview-container">
          <div class="preview-sidebar" [style.background]="colorsForm.get('sidebarColor')?.value">
            <div class="preview-logo">
              <img *ngIf="currentLogo" [src]="currentLogo" alt="Logo">
              <span *ngIf="!currentLogo">GUCE</span>
            </div>
            <div class="preview-menu">
              <div class="menu-item active" [style.background]="colorsForm.get('primaryColor')?.value">Dashboard</div>
              <div class="menu-item">Déclarations</div>
              <div class="menu-item">Documents</div>
            </div>
          </div>
          <div class="preview-content">
            <div class="preview-header" [style.background]="colorsForm.get('primaryColor')?.value">
              <span>GUCE - Guichet Unique</span>
            </div>
            <div class="preview-body">
              <div class="preview-card-item">
                <div class="card-header" [style.border-color]="colorsForm.get('primaryColor')?.value">Carte exemple</div>
                <div class="card-body">
                  <button class="preview-btn primary" [style.background]="colorsForm.get('primaryColor')?.value">
                    Bouton principal
                  </button>
                  <button class="preview-btn secondary" [style.border-color]="colorsForm.get('secondaryColor')?.value" [style.color]="colorsForm.get('secondaryColor')?.value">
                    Secondaire
                  </button>
                  <button class="preview-btn accent" [style.background]="colorsForm.get('accentColor')?.value">
                    Accent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-card class="settings-card">
        <h2>Textes personnalisés</h2>

        <form [formGroup]="textsForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre de la page de connexion</mat-label>
            <input matInput formControlName="loginTitle">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message d'accueil</mat-label>
            <textarea matInput formControlName="welcomeMessage" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Pied de page</mat-label>
            <input matInput formControlName="footerText">
          </mat-form-field>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .branding-settings { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .settings-card { padding: 24px; h2 { margin: 0 0 24px; font-size: 18px; } }
    .upload-section { margin-bottom: 24px; label { display: block; margin-bottom: 8px; font-weight: 500; } }
    .upload-zone { border: 2px dashed #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; &:hover { border-color: #1976d2; background: #fafafa; } img { max-height: 80px; } &.small { width: 80px; height: 80px; padding: 16px; img { max-height: 48px; } } .upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #757575; mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; } .hint { font-size: 12px; margin-top: 4px; } } }
    .color-field { margin-bottom: 16px; label { display: block; margin-bottom: 8px; font-weight: 500; } .color-input { display: flex; gap: 12px; align-items: center; input[type="color"] { width: 48px; height: 48px; border: none; border-radius: 8px; cursor: pointer; } input[type="text"] { flex: 1; } } }
    .preview-card { padding: 24px; margin-bottom: 24px; h2 { margin: 0 0 24px; font-size: 18px; } }
    .preview-container { display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; height: 300px; }
    .preview-sidebar { width: 200px; padding: 16px; color: white; .preview-logo { margin-bottom: 24px; text-align: center; font-weight: 600; img { max-height: 40px; } } .preview-menu { .menu-item { padding: 10px 16px; border-radius: 4px; margin-bottom: 4px; opacity: 0.8; &.active { opacity: 1; } } } }
    .preview-content { flex: 1; display: flex; flex-direction: column; .preview-header { padding: 12px 16px; color: white; font-weight: 500; } .preview-body { flex: 1; padding: 16px; background: #f5f5f5; .preview-card-item { background: white; border-radius: 8px; overflow: hidden; .card-header { padding: 12px 16px; border-left: 4px solid; font-weight: 500; } .card-body { padding: 16px; display: flex; gap: 12px; .preview-btn { padding: 8px 16px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; &.primary { color: white; } &.secondary { background: white; } &.accent { color: white; border: none; } } } } } }
    .full-width { width: 100%; }
    @media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }
  `]
})
export class BrandingSettingsComponent {
  private fb = inject(FormBuilder);

  currentLogo: string | null = null;
  currentFavicon: string | null = null;

  colorsForm: FormGroup;
  textsForm: FormGroup;

  constructor() {
    this.colorsForm = this.fb.group({
      primaryColor: ['#1976d2'],
      secondaryColor: ['#424242'],
      accentColor: ['#ff9800'],
      sidebarColor: ['#263238']
    });

    this.textsForm = this.fb.group({
      loginTitle: ['Bienvenue sur GUCE'],
      welcomeMessage: ['Guichet Unique du Commerce Extérieur - Votre partenaire pour simplifier vos opérations'],
      footerText: ['© {{YEAR}} GUCE {{COUNTRY_NAME}} - Tous droits réservés']
    });
  }

  saveSettings(): void {
    console.log('Saving branding settings...');
  }
}
