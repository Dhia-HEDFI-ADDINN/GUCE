import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-form-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="form-builder">
      <div class="page-header">
        <button mat-icon-button routerLink="/config/procedures/list"><mat-icon>arrow_back</mat-icon></button>
        <h1>Form Builder</h1>
        <button mat-flat-button color="primary"><mat-icon>save</mat-icon> Enregistrer</button>
      </div>

      <div class="builder-area">
        <mat-card class="canvas-card">
          <div class="form-preview">
            <div class="form-field">
              <label>Référence</label>
              <input type="text" disabled placeholder="Auto-généré">
            </div>
            <div class="form-field">
              <label>Description *</label>
              <textarea disabled placeholder="Description des marchandises"></textarea>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Quantité *</label>
                <input type="number" disabled>
              </div>
              <div class="form-field">
                <label>Valeur *</label>
                <input type="number" disabled>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="toolbox-card">
          <h3>Champs</h3>
          <div class="toolbox-items">
            <div class="tool-item"><mat-icon>short_text</mat-icon> Texte court</div>
            <div class="tool-item"><mat-icon>notes</mat-icon> Texte long</div>
            <div class="tool-item"><mat-icon>pin</mat-icon> Nombre</div>
            <div class="tool-item"><mat-icon>today</mat-icon> Date</div>
            <div class="tool-item"><mat-icon>list</mat-icon> Liste</div>
            <div class="tool-item"><mat-icon>attach_file</mat-icon> Fichier</div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .form-builder { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { flex: 1; margin: 0; } }
    .builder-area { display: grid; grid-template-columns: 1fr 250px; gap: 24px; }
    .canvas-card { padding: 24px; .form-preview { max-width: 500px; .form-field { margin-bottom: 16px; label { display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; } input, textarea { width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 4px; } } .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } } }
    .toolbox-card { h3 { margin: 0 0 16px; } .toolbox-items { display: flex; flex-direction: column; gap: 8px; } .tool-item { display: flex; align-items: center; gap: 8px; padding: 12px; background: #fafafa; border-radius: 8px; cursor: grab; &:hover { background: #f0f0f0; } } }
  `]
})
export class FormBuilderComponent {}
