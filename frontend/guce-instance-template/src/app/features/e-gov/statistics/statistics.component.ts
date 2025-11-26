import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatSelectModule],
  template: `
    <div class="statistics-container">
      <div class="page-header">
        <h1>Statistiques</h1>
        <mat-form-field appearance="outline">
          <mat-label>Période</mat-label>
          <mat-select [(ngModel)]="period">
            <mat-option value="today">Aujourd'hui</mat-option>
            <mat-option value="week">Cette semaine</mat-option>
            <mat-option value="month">Ce mois</mat-option>
            <mat-option value="year">Cette année</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.totalProcessed }}</div>
          <div class="kpi-label">Dossiers traités</div>
          <div class="kpi-trend positive">+12% vs période précédente</div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.avgTime }}h</div>
          <div class="kpi-label">Temps moyen de traitement</div>
          <div class="kpi-trend negative">+2h vs période précédente</div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.approvalRate }}%</div>
          <div class="kpi-label">Taux d'approbation</div>
          <div class="kpi-trend positive">+3% vs période précédente</div>
        </mat-card>
        <mat-card class="kpi-card">
          <div class="kpi-value">{{ kpis.onTimeRate }}%</div>
          <div class="kpi-label">Dans les délais</div>
          <div class="kpi-trend neutral">Stable</div>
        </mat-card>
      </div>

      <!-- Charts Placeholder -->
      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Dossiers par type</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>pie_chart</mat-icon>
              <p>Graphique des types de dossiers</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Évolution mensuelle</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>show_chart</mat-icon>
              <p>Graphique d'évolution</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Top Operators -->
      <mat-card class="operators-card">
        <mat-card-header>
          <mat-card-title>Top opérateurs par volume</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="operator-list">
            <div class="operator-item" *ngFor="let op of topOperators; let i = index">
              <span class="rank">{{ i + 1 }}</span>
              <span class="name">{{ op.name }}</span>
              <span class="count">{{ op.count }} dossiers</span>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="(op.count / topOperators[0].count) * 100"></div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .statistics-container { padding: 24px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 24px; }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
    }

    .kpi-card {
      padding: 24px;
      text-align: center;

      .kpi-value { font-size: 36px; font-weight: 700; color: #1976d2; }
      .kpi-label { font-size: 14px; color: #616161; margin: 8px 0; }
      .kpi-trend {
        font-size: 12px;
        &.positive { color: #4caf50; }
        &.negative { color: #f44336; }
        &.neutral { color: #9e9e9e; }
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      .chart-placeholder {
        height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        border-radius: 8px;

        mat-icon { font-size: 64px; width: 64px; height: 64px; color: #e0e0e0; }
        p { color: #9e9e9e; }
      }
    }

    .operators-card {
      .operator-list {
        .operator-item {
          display: grid;
          grid-template-columns: 40px 1fr 120px 200px;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          .rank {
            width: 28px;
            height: 28px;
            background: #e0e0e0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .name { font-weight: 500; }
          .count { text-align: right; color: #757575; }

          .bar-wrapper {
            background: #e0e0e0;
            border-radius: 4px;
            height: 8px;

            .bar {
              height: 100%;
              background: #1976d2;
              border-radius: 4px;
            }
          }
        }
      }
    }
  `]
})
export class StatisticsComponent {
  period = 'month';
  kpis = { totalProcessed: 245, avgTime: 18, approvalRate: 87, onTimeRate: 78 };
  topOperators = [
    { name: 'SARL Tech Import', count: 45 },
    { name: 'Agro Export SA', count: 38 },
    { name: 'Auto Parts SARL', count: 32 },
    { name: 'Cacao Plus', count: 28 },
    { name: 'Transport Express', count: 22 }
  ];
}
