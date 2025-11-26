import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-workflow-designer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="workflow-designer">
      <div class="page-header">
        <button mat-icon-button routerLink="/config/procedures/list"><mat-icon>arrow_back</mat-icon></button>
        <h1>Workflow Designer</h1>
        <button mat-flat-button color="primary"><mat-icon>save</mat-icon> Enregistrer</button>
      </div>

      <div class="designer-area">
        <mat-card class="canvas-card">
          <div class="workflow-canvas">
            <div class="workflow-step start">
              <mat-icon>play_circle</mat-icon>
              <span>Début</span>
            </div>
            <div class="workflow-arrow"><mat-icon>arrow_downward</mat-icon></div>
            <div class="workflow-step">
              <mat-icon>assignment</mat-icon>
              <span>Soumission</span>
            </div>
            <div class="workflow-arrow"><mat-icon>arrow_downward</mat-icon></div>
            <div class="workflow-step">
              <mat-icon>fact_check</mat-icon>
              <span>Vérification</span>
            </div>
            <div class="workflow-arrow"><mat-icon>arrow_downward</mat-icon></div>
            <div class="workflow-step">
              <mat-icon>gavel</mat-icon>
              <span>Décision</span>
            </div>
            <div class="workflow-arrow"><mat-icon>arrow_downward</mat-icon></div>
            <div class="workflow-step end">
              <mat-icon>check_circle</mat-icon>
              <span>Fin</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="toolbox-card">
          <h3>Éléments</h3>
          <div class="toolbox-items">
            <div class="tool-item"><mat-icon>assignment</mat-icon> Tâche</div>
            <div class="tool-item"><mat-icon>call_split</mat-icon> Condition</div>
            <div class="tool-item"><mat-icon>mail</mat-icon> Notification</div>
            <div class="tool-item"><mat-icon>timer</mat-icon> Délai</div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .workflow-designer { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { flex: 1; margin: 0; } }
    .designer-area { display: grid; grid-template-columns: 1fr 250px; gap: 24px; }
    .canvas-card { min-height: 500px; padding: 24px; .workflow-canvas { display: flex; flex-direction: column; align-items: center; gap: 8px; } .workflow-step { display: flex; align-items: center; gap: 8px; padding: 16px 32px; background: #e3f2fd; border-radius: 8px; border: 2px solid #1976d2; &.start { background: #e8f5e9; border-color: #4caf50; } &.end { background: #e8f5e9; border-color: #4caf50; } } .workflow-arrow { color: #9e9e9e; } }
    .toolbox-card { h3 { margin: 0 0 16px; } .toolbox-items { display: flex; flex-direction: column; gap: 8px; } .tool-item { display: flex; align-items: center; gap: 8px; padding: 12px; background: #fafafa; border-radius: 8px; cursor: grab; &:hover { background: #f0f0f0; } } }
  `]
})
export class WorkflowDesignerComponent {}
