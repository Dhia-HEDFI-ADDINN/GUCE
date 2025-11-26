import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'guce-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatRadioModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="checkout-container">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
        <h1>Paiement</h1>
      </div>

      <div class="checkout-grid">
        <!-- Order Summary -->
        <mat-card class="summary-card">
          <mat-card-header><mat-card-title>Récapitulatif</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="order-info">
              <p class="order-ref">Référence: {{ payment.reference }}</p>
              <p class="order-desc">{{ payment.description }}</p>
            </div>

            <div class="fee-list">
              <div class="fee-item" *ngFor="let fee of payment.fees">
                <span class="fee-label">{{ fee.label }}</span>
                <span class="fee-amount">{{ formatCurrency(fee.amount) }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="total-row">
              <span>Total à payer</span>
              <span class="total-amount">{{ formatCurrency(getTotal()) }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Payment Methods -->
        <mat-card class="methods-card">
          <mat-card-header><mat-card-title>Mode de paiement</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-radio-group [(ngModel)]="selectedMethod" class="method-list">
              <mat-radio-button *ngFor="let method of paymentMethods" [value]="method.id" class="method-item">
                <div class="method-content">
                  <img [src]="method.logo" [alt]="method.name" class="method-logo">
                  <div class="method-info">
                    <span class="method-name">{{ method.name }}</span>
                    <span class="method-desc">{{ method.description }}</span>
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>

            <div class="payment-actions">
              <button mat-flat-button color="primary" class="pay-btn" (click)="pay()" [disabled]="!selectedMethod || processing">
                <mat-spinner *ngIf="processing" diameter="20"></mat-spinner>
                <span *ngIf="!processing">Payer {{ formatCurrency(getTotal()) }}</span>
              </button>
              <p class="secure-notice">
                <mat-icon>lock</mat-icon>
                Paiement sécurisé
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h1 { margin: 0; } }

    .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; @media (max-width: 768px) { grid-template-columns: 1fr; } }

    .summary-card {
      .order-info { margin-bottom: 24px; .order-ref { font-weight: 500; margin: 0 0 4px; } .order-desc { color: #757575; margin: 0; } }
      .fee-list { .fee-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; } }
      .total-row { display: flex; justify-content: space-between; padding-top: 16px; font-size: 18px; font-weight: 600; .total-amount { color: #1976d2; } }
    }

    .methods-card {
      .method-list { display: flex; flex-direction: column; gap: 12px; }
      .method-item {
        ::ng-deep .mdc-form-field { width: 100%; }
        .method-content { display: flex; align-items: center; gap: 16px; padding: 12px; background: #fafafa; border-radius: 8px; width: 100%; }
        .method-logo { width: 48px; height: 32px; object-fit: contain; }
        .method-info { .method-name { display: block; font-weight: 500; } .method-desc { font-size: 12px; color: #757575; } }
      }
      .payment-actions { margin-top: 24px; .pay-btn { width: 100%; padding: 16px; font-size: 16px; } .secure-notice { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 12px; font-size: 12px; color: #757575; mat-icon { font-size: 16px; width: 16px; height: 16px; } } }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedMethod = '';
  processing = false;

  payment = {
    reference: 'IMP-2024-001234',
    description: 'Droits et taxes - Déclaration Import',
    fees: [
      { label: 'Droits de douane (20%)', amount: 3500000 },
      { label: 'TVA (19.25%)', amount: 4043750 },
      { label: 'Précompte (1%)', amount: 175000 },
      { label: 'Redevance douanière', amount: 78750 }
    ]
  };

  paymentMethods = [
    { id: 'mobile_money', name: 'Mobile Money', description: 'MTN, Orange Money', logo: 'assets/images/mobile-money.png' },
    { id: 'bank_card', name: 'Carte bancaire', description: 'Visa, Mastercard', logo: 'assets/images/card.png' },
    { id: 'bank_transfer', name: 'Virement bancaire', description: 'Transfert direct', logo: 'assets/images/bank.png' }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const reference = params['reference'];
      // Load payment details
    });
  }

  getTotal(): number {
    return this.payment.fees.reduce((sum, f) => sum + f.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }

  pay() {
    this.processing = true;
    setTimeout(() => {
      this.processing = false;
      this.router.navigate(['/e-payment/success']);
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/e-force/declarations', '1']);
  }
}
