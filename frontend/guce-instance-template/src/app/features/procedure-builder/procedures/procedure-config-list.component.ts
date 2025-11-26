import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'guce-procedure-config-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatMenuModule],
  template: `
    <div class="procedure-config-container">
      <div class="page-header">
        <h1>Configuration des procédures</h1>
        <button mat-flat-button color="primary" routerLink="/config/procedures/create">
          <mat-icon>add</mat-icon> Nouvelle procédure
        </button>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="procedures">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let p">{{ p.code }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Catégorie</th>
            <td mat-cell *matCellDef="let p">{{ p.category }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [class]="'status-' + p.status">{{ p.status === 'active' ? 'Actif' : 'Inactif' }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/config/procedures', p.id, 'edit']">
                  <mat-icon>edit</mat-icon> Modifier
                </button>
                <button mat-menu-item [routerLink]="['/config/workflow-designer', p.workflowId]">
                  <mat-icon>account_tree</mat-icon> Workflow
                </button>
                <button mat-menu-item [routerLink]="['/config/form-builder', p.formId]">
                  <mat-icon>dynamic_form</mat-icon> Formulaire
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .procedure-config-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h1 { margin: 0; } }
    .table-card { overflow: hidden; table { width: 100%; } }
    ::ng-deep { .status-active { background: #e8f5e9 !important; color: #2e7d32 !important; } .status-inactive { background: #f5f5f5 !important; color: #616161 !important; } }
  `]
})
export class ProcedureConfigListComponent {
  displayedColumns = ['code', 'name', 'category', 'status', 'actions'];
  procedures = [
    { id: '1', code: 'DECL-IMP', name: 'Déclaration Import', category: 'Import', status: 'active', workflowId: 'wf1', formId: 'f1' },
    { id: '2', code: 'DECL-EXP', name: 'Déclaration Export', category: 'Export', status: 'active', workflowId: 'wf2', formId: 'f2' },
    { id: '3', code: 'CERT-ORIG', name: 'Certificat Origine', category: 'Certificat', status: 'active', workflowId: 'wf3', formId: 'f3' }
  ];
}
