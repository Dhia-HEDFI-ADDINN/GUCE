import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '@env/environment';

@Component({
  selector: 'guce-eforce-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="eforce-dashboard">
      <!-- Header Stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <div class="stat-icon import">
            <mat-icon>file_upload</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.imports }}</span>
            <span class="stat-label">Déclarations Import</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon export">
            <mat-icon>file_download</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.exports }}</span>
            <span class="stat-label">Déclarations Export</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon transit">
            <mat-icon>local_shipping</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.transits }}</span>
            <span class="stat-label">Transits</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon pending">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <mat-card class="actions-card">
        <mat-card-header>
          <mat-card-title>Nouvelle déclaration</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-flat-button color="primary" routerLink="/e-force/declarations/new/import" class="action-btn">
              <mat-icon>file_upload</mat-icon>
              <div class="btn-text">
                <span class="btn-title">Import</span>
                <span class="btn-desc">Déclaration d'importation</span>
              </div>
            </button>
            <button mat-flat-button class="action-btn export-btn" routerLink="/e-force/declarations/new/export">
              <mat-icon>file_download</mat-icon>
              <div class="btn-text">
                <span class="btn-title">Export</span>
                <span class="btn-desc">Déclaration d'exportation</span>
              </div>
            </button>
            <button mat-flat-button class="action-btn transit-btn" routerLink="/e-force/declarations/new/transit">
              <mat-icon>local_shipping</mat-icon>
              <div class="btn-text">
                <span class="btn-title">Transit</span>
                <span class="btn-desc">Déclaration de transit</span>
              </div>
            </button>
            <button mat-stroked-button class="action-btn procedure-btn" routerLink="/e-force/procedures">
              <mat-icon>assignment</mat-icon>
              <div class="btn-text">
                <span class="btn-title">Procédures</span>
                <span class="btn-desc">Autres procédures</span>
              </div>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Recent Declarations -->
        <mat-card class="declarations-card">
          <mat-card-header>
            <mat-card-title>Mes déclarations récentes</mat-card-title>
            <button mat-button color="primary" routerLink="/e-force/declarations/import">
              Voir tout <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="Import">
                <div class="declaration-list">
                  <div class="declaration-item" *ngFor="let decl of recentImports" [routerLink]="['/e-force/declarations', decl.id]">
                    <div class="decl-main">
                      <span class="decl-ref">{{ decl.reference }}</span>
                      <span class="decl-goods">{{ decl.goods }}</span>
                    </div>
                    <div class="decl-meta">
                      <mat-chip [class]="'status-' + decl.status">{{ getStatusLabel(decl.status) }}</mat-chip>
                      <span class="decl-date">{{ decl.date }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>
              <mat-tab label="Export">
                <div class="declaration-list">
                  <div class="declaration-item" *ngFor="let decl of recentExports" [routerLink]="['/e-force/declarations', decl.id]">
                    <div class="decl-main">
                      <span class="decl-ref">{{ decl.reference }}</span>
                      <span class="decl-goods">{{ decl.goods }}</span>
                    </div>
                    <div class="decl-meta">
                      <mat-chip [class]="'status-' + decl.status">{{ getStatusLabel(decl.status) }}</mat-chip>
                      <span class="decl-date">{{ decl.date }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>
              <mat-tab label="Transit">
                <div class="declaration-list">
                  <div class="declaration-item" *ngFor="let decl of recentTransits" [routerLink]="['/e-force/declarations', decl.id]">
                    <div class="decl-main">
                      <span class="decl-ref">{{ decl.reference }}</span>
                      <span class="decl-goods">{{ decl.goods }}</span>
                    </div>
                    <div class="decl-meta">
                      <mat-chip [class]="'status-' + decl.status">{{ getStatusLabel(decl.status) }}</mat-chip>
                      <span class="decl-date">{{ decl.date }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Pending Actions -->
          <mat-card class="pending-card">
            <mat-card-header>
              <mat-card-title>Actions requises</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="pending-list">
                <div class="pending-item" *ngFor="let item of pendingActions">
                  <div class="pending-icon" [class]="item.type">
                    <mat-icon>{{ item.icon }}</mat-icon>
                  </div>
                  <div class="pending-info">
                    <span class="pending-title">{{ item.title }}</span>
                    <span class="pending-ref">{{ item.reference }}</span>
                  </div>
                  <button mat-icon-button [routerLink]="item.route">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                <div class="no-pending" *ngIf="pendingActions.length === 0">
                  <mat-icon>check_circle</mat-icon>
                  <p>Aucune action requise</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Summary -->
          <mat-card class="payment-card">
            <mat-card-header>
              <mat-card-title>Paiements</mat-card-title>
              <button mat-button color="primary" routerLink="/e-force/payments">Historique</button>
            </mat-card-header>
            <mat-card-content>
              <div class="payment-summary">
                <div class="payment-item">
                  <span class="payment-label">En attente</span>
                  <span class="payment-value pending">{{ formatCurrency(payments.pending) }}</span>
                </div>
                <div class="payment-item">
                  <span class="payment-label">Payé ce mois</span>
                  <span class="payment-value paid">{{ formatCurrency(payments.paidThisMonth) }}</span>
                </div>
                <div class="payment-item">
                  <span class="payment-label">Total annuel</span>
                  <span class="payment-value">{{ formatCurrency(payments.totalYear) }}</span>
                </div>
              </div>
              <button mat-flat-button color="primary" class="pay-btn" routerLink="/e-payment/history">
                <mat-icon>payment</mat-icon>
                Effectuer un paiement
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .eforce-dashboard {
      padding: 24px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: white;
        }

        &.import { background: linear-gradient(135deg, #1976d2, #1565c0); }
        &.export { background: linear-gradient(135deg, #388e3c, #2e7d32); }
        &.transit { background: linear-gradient(135deg, #f57c00, #ef6c00); }
        &.pending { background: linear-gradient(135deg, #7b1fa2, #6a1b9a); }
      }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
        }

        .stat-label {
          font-size: 13px;
          color: #757575;
        }
      }
    }

    .actions-card {
      margin-bottom: 24px;

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        @media (max-width: 900px) {
          grid-template-columns: repeat(2, 1fr);
        }

        .action-btn {
          height: auto;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }

          .btn-text {
            display: flex;
            flex-direction: column;

            .btn-title {
              font-size: 16px;
              font-weight: 600;
            }

            .btn-desc {
              font-size: 12px;
              opacity: 0.8;
              font-weight: normal;
            }
          }

          &.export-btn {
            background: #388e3c;
            color: white;
          }

          &.transit-btn {
            background: #f57c00;
            color: white;
          }

          &.procedure-btn {
            border-color: #9e9e9e;
            color: #616161;
          }
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .declarations-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        button mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-left: 4px;
        }
      }

      .declaration-list {
        padding: 16px 0;
      }

      .declaration-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        margin: 8px 0;
        background: #fafafa;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f0f0f0;
        }

        .decl-main {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .decl-ref {
            font-weight: 600;
            font-size: 14px;
          }

          .decl-goods {
            font-size: 13px;
            color: #757575;
          }
        }

        .decl-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .decl-date {
            font-size: 12px;
            color: #9e9e9e;
          }
        }
      }
    }

    ::ng-deep {
      .status-draft { background-color: #f5f5f5 !important; color: #616161 !important; }
      .status-submitted { background-color: #e3f2fd !important; color: #1565c0 !important; }
      .status-processing { background-color: #fff3e0 !important; color: #e65100 !important; }
      .status-approved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .status-rejected { background-color: #ffebee !important; color: #c62828 !important; }
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .pending-card {
      .pending-list {
        .pending-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .pending-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }

            &.payment { background: #fff3e0; color: #e65100; }
            &.document { background: #e3f2fd; color: #1565c0; }
            &.correction { background: #ffebee; color: #c62828; }
          }

          .pending-info {
            flex: 1;
            display: flex;
            flex-direction: column;

            .pending-title {
              font-weight: 500;
              font-size: 14px;
            }

            .pending-ref {
              font-size: 12px;
              color: #757575;
            }
          }
        }

        .no-pending {
          text-align: center;
          padding: 32px;
          color: #4caf50;

          mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
          }

          p {
            margin: 8px 0 0;
            color: #757575;
          }
        }
      }
    }

    .payment-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .payment-summary {
        margin-bottom: 16px;

        .payment-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .payment-label {
            color: #757575;
            font-size: 14px;
          }

          .payment-value {
            font-weight: 600;
            font-size: 14px;

            &.pending { color: #e65100; }
            &.paid { color: #2e7d32; }
          }
        }
      }

      .pay-btn {
        width: 100%;
        padding: 12px;

        mat-icon {
          margin-right: 8px;
        }
      }
    }
  `]
})
export class EforceDashboardComponent implements OnInit {
  private keycloak = inject(KeycloakService);

  currency = environment.instance.currency || 'XAF';

  stats = {
    imports: 12,
    exports: 5,
    transits: 3,
    pending: 8
  };

  recentImports = [
    { id: '1', reference: 'IMP-2024-001234', goods: 'Équipements informatiques', status: 'processing', date: '10/12/2024' },
    { id: '2', reference: 'IMP-2024-001233', goods: 'Pièces automobiles', status: 'approved', date: '09/12/2024' },
    { id: '3', reference: 'IMP-2024-001232', goods: 'Produits pharmaceutiques', status: 'submitted', date: '08/12/2024' }
  ];

  recentExports = [
    { id: '4', reference: 'EXP-2024-005678', goods: 'Cacao en fèves', status: 'approved', date: '10/12/2024' },
    { id: '5', reference: 'EXP-2024-005677', goods: 'Bois transformé', status: 'processing', date: '08/12/2024' }
  ];

  recentTransits = [
    { id: '6', reference: 'TRS-2024-000123', goods: 'Conteneur scellé', status: 'processing', date: '11/12/2024' }
  ];

  pendingActions = [
    { icon: 'payment', type: 'payment', title: 'Paiement requis', reference: 'IMP-2024-001234', route: '/e-payment/checkout/IMP-2024-001234' },
    { icon: 'upload_file', type: 'document', title: 'Document manquant', reference: 'EXP-2024-005677', route: '/e-force/declarations/5' },
    { icon: 'edit', type: 'correction', title: 'Correction demandée', reference: 'IMP-2024-001232', route: '/e-force/declarations/3/edit' }
  ];

  payments = {
    pending: 2500000,
    paidThisMonth: 8750000,
    totalYear: 45000000
  };

  ngOnInit() {}

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumise',
      processing: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
