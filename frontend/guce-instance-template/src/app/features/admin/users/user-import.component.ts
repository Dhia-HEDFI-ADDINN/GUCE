import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'guce-user-import',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatStepperModule,
    MatTableModule, MatSelectModule, MatProgressBarModule
  ],
  template: `
    <div class="user-import">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/users">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Importer des utilisateurs</h1>
      </div>

      <mat-stepper linear #stepper>
        <mat-step label="Télécharger fichier">
          <div class="step-content">
            <mat-card class="upload-card">
              <div class="upload-zone" [class.dragover]="isDragover"
                   (dragover)="onDragOver($event)" (dragleave)="isDragover = false"
                   (drop)="onDrop($event)" (click)="fileInput.click()">
                <input #fileInput type="file" hidden accept=".csv,.xlsx" (change)="onFileSelect($event)">
                <mat-icon>cloud_upload</mat-icon>
                <h3>Déposez votre fichier ici</h3>
                <p>ou cliquez pour sélectionner</p>
                <span class="formats">Formats acceptés: CSV, Excel (.xlsx)</span>
              </div>

              <div class="file-info" *ngIf="uploadedFile">
                <mat-icon>description</mat-icon>
                <div class="file-details">
                  <span class="file-name">{{ uploadedFile.name }}</span>
                  <span class="file-size">{{ formatFileSize(uploadedFile.size) }}</span>
                </div>
                <button mat-icon-button (click)="removeFile()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </mat-card>

            <mat-card class="template-card">
              <h3>Modèle de fichier</h3>
              <p>Téléchargez le modèle pour vous assurer que votre fichier respecte le format requis.</p>
              <button mat-stroked-button>
                <mat-icon>download</mat-icon> Télécharger le modèle CSV
              </button>
            </mat-card>

            <div class="step-actions">
              <button mat-flat-button color="primary" matStepperNext [disabled]="!uploadedFile">
                Continuer
              </button>
            </div>
          </div>
        </mat-step>

        <mat-step label="Mapper les colonnes">
          <div class="step-content">
            <mat-card class="mapping-card">
              <p>Associez les colonnes de votre fichier aux champs utilisateur</p>

              <table mat-table [dataSource]="columnMappings">
                <ng-container matColumnDef="fileColumn">
                  <th mat-header-cell *matHeaderCellDef>Colonne du fichier</th>
                  <td mat-cell *matCellDef="let mapping">{{ mapping.fileColumn }}</td>
                </ng-container>

                <ng-container matColumnDef="preview">
                  <th mat-header-cell *matHeaderCellDef>Aperçu</th>
                  <td mat-cell *matCellDef="let mapping" class="preview-cell">{{ mapping.preview }}</td>
                </ng-container>

                <ng-container matColumnDef="field">
                  <th mat-header-cell *matHeaderCellDef>Champ GUCE</th>
                  <td mat-cell *matCellDef="let mapping">
                    <mat-select [(value)]="mapping.field">
                      <mat-option value="">-- Ignorer --</mat-option>
                      <mat-option *ngFor="let field of userFields" [value]="field.id">{{ field.label }}</mat-option>
                    </mat-select>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="mappingColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: mappingColumns;"></tr>
              </table>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Retour</button>
              <button mat-flat-button color="primary" matStepperNext>Continuer</button>
            </div>
          </div>
        </mat-step>

        <mat-step label="Vérifier">
          <div class="step-content">
            <mat-card class="preview-card">
              <div class="import-summary">
                <div class="summary-item valid">
                  <mat-icon>check_circle</mat-icon>
                  <span class="count">{{ importSummary.valid }}</span>
                  <span class="label">Utilisateurs valides</span>
                </div>
                <div class="summary-item warning">
                  <mat-icon>warning</mat-icon>
                  <span class="count">{{ importSummary.warnings }}</span>
                  <span class="label">Avertissements</span>
                </div>
                <div class="summary-item error">
                  <mat-icon>error</mat-icon>
                  <span class="count">{{ importSummary.errors }}</span>
                  <span class="label">Erreurs</span>
                </div>
              </div>

              <h3>Aperçu des données</h3>
              <table mat-table [dataSource]="previewData">
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let row">
                    <mat-icon [class]="row.status">{{ getStatusIcon(row.status) }}</mat-icon>
                  </td>
                </ng-container>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nom</th>
                  <td mat-cell *matCellDef="let row">{{ row.name }}</td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let row">{{ row.email }}</td>
                </ng-container>
                <ng-container matColumnDef="organization">
                  <th mat-header-cell *matHeaderCellDef>Organisation</th>
                  <td mat-cell *matCellDef="let row">{{ row.organization }}</td>
                </ng-container>
                <ng-container matColumnDef="message">
                  <th mat-header-cell *matHeaderCellDef>Message</th>
                  <td mat-cell *matCellDef="let row" class="message-cell">{{ row.message }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="previewColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: previewColumns;"></tr>
              </table>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Retour</button>
              <button mat-flat-button color="primary" matStepperNext [disabled]="importSummary.errors > 0">
                Lancer l'import
              </button>
            </div>
          </div>
        </mat-step>

        <mat-step label="Import">
          <div class="step-content">
            <mat-card class="progress-card">
              <div class="progress-info" *ngIf="!importComplete">
                <mat-icon class="spinning">sync</mat-icon>
                <h2>Import en cours...</h2>
                <p>{{ importProgress }} / {{ importSummary.valid }} utilisateurs</p>
                <mat-progress-bar mode="determinate" [value]="(importProgress / importSummary.valid) * 100"></mat-progress-bar>
              </div>

              <div class="complete-info" *ngIf="importComplete">
                <mat-icon class="success">check_circle</mat-icon>
                <h2>Import terminé</h2>
                <p>{{ importSummary.valid }} utilisateurs ont été importés avec succès</p>
                <button mat-flat-button color="primary" routerLink="/admin/users">
                  Voir les utilisateurs
                </button>
              </div>
            </mat-card>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .user-import { padding: 24px; max-width: 900px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }
    .step-content { padding: 24px 0; }
    .upload-card { padding: 24px; margin-bottom: 24px; }
    .upload-zone { border: 2px dashed #e0e0e0; border-radius: 8px; padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s; &:hover, &.dragover { border-color: #1976d2; background: #f5f5f5; } mat-icon { font-size: 48px; width: 48px; height: 48px; color: #757575; } h3 { margin: 16px 0 8px; } p { margin: 0; color: #757575; } .formats { display: block; margin-top: 16px; font-size: 12px; color: #9e9e9e; } }
    .file-info { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px; margin-top: 16px; mat-icon { color: #1976d2; } .file-details { flex: 1; display: flex; flex-direction: column; .file-name { font-weight: 500; } .file-size { font-size: 12px; color: #757575; } } }
    .template-card { padding: 24px; h3 { margin: 0 0 8px; } p { margin: 0 0 16px; color: #757575; } }
    .mapping-card { padding: 24px; p { margin: 0 0 24px; color: #757575; } table { width: 100%; } .preview-cell { color: #757575; font-size: 12px; } mat-select { width: 200px; } }
    .preview-card { padding: 24px; .import-summary { display: flex; gap: 24px; margin-bottom: 24px; .summary-item { display: flex; align-items: center; gap: 8px; padding: 16px 24px; background: #f5f5f5; border-radius: 8px; .count { font-size: 24px; font-weight: 600; } .label { color: #757575; } &.valid mat-icon { color: #4caf50; } &.warning mat-icon { color: #ff9800; } &.error mat-icon { color: #f44336; } } } h3 { margin: 0 0 16px; } table { width: 100%; } .message-cell { color: #757575; font-size: 12px; } mat-icon { &.valid { color: #4caf50; } &.warning { color: #ff9800; } &.error { color: #f44336; } } }
    .progress-card { padding: 48px; text-align: center; .progress-info, .complete-info { mat-icon { font-size: 64px; width: 64px; height: 64px; &.spinning { animation: spin 1s linear infinite; color: #1976d2; } &.success { color: #4caf50; } } h2 { margin: 16px 0 8px; } p { margin: 0 0 24px; color: #757575; } mat-progress-bar { margin-top: 24px; } } }
    .step-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class UserImportComponent {
  isDragover = false;
  uploadedFile: File | null = null;
  importComplete = false;
  importProgress = 0;

  mappingColumns = ['fileColumn', 'preview', 'field'];
  previewColumns = ['status', 'name', 'email', 'organization', 'message'];

  userFields = [
    { id: 'firstName', label: 'Prénom' },
    { id: 'lastName', label: 'Nom' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Téléphone' },
    { id: 'organization', label: 'Organisation' },
    { id: 'role', label: 'Rôle' },
    { id: 'jobTitle', label: 'Fonction' }
  ];

  columnMappings = [
    { fileColumn: 'Prénom', preview: 'Jean', field: 'firstName' },
    { fileColumn: 'Nom', preview: 'Dupont', field: 'lastName' },
    { fileColumn: 'Adresse email', preview: 'jean@example.com', field: 'email' },
    { fileColumn: 'Téléphone', preview: '+237 612...', field: 'phone' },
    { fileColumn: 'Entreprise', preview: 'Import SARL', field: 'organization' }
  ];

  importSummary = { valid: 45, warnings: 3, errors: 2 };

  previewData = [
    { status: 'valid', name: 'Jean Dupont', email: 'jean@example.com', organization: 'Import SARL', message: '' },
    { status: 'valid', name: 'Marie Claire', email: 'marie@admin.gov', organization: 'Douanes', message: '' },
    { status: 'warning', name: 'Pierre Martin', email: 'pierre@transit.com', organization: '', message: 'Organisation non spécifiée' },
    { status: 'error', name: 'Sophie', email: 'invalid-email', organization: 'Test', message: 'Email invalide' }
  ];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
    if (event.dataTransfer?.files.length) {
      this.uploadedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadedFile = input.files[0];
    }
  }

  removeFile(): void {
    this.uploadedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = { valid: 'check_circle', warning: 'warning', error: 'error' };
    return icons[status] || 'info';
  }
}
