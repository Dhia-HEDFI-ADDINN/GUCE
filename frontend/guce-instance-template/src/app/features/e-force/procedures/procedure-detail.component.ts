import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'guce-procedure-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="procedure-detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Détails de la procédure</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Contenu du détail de la procédure...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .procedure-detail-container {
      padding: 24px;
    }
  `]
})
export class ProcedureDetailComponent {}
