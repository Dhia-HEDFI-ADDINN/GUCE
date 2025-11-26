import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'guce-payment-methods',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  template: `
    <div class="methods-container">
      <h1>Moyens de paiement</h1>
      <p>Gérez vos moyens de paiement enregistrés</p>

      <div class="methods-list">
        <mat-card class="method-card" *ngFor="let method of savedMethods">
          <div class="method-icon"><mat-icon>{{ method.icon }}</mat-icon></div>
          <div class="method-info">
            <span class="method-name">{{ method.name }}</span>
            <span class="method-details">{{ method.details }}</span>
          </div>
          <mat-slide-toggle [checked]="method.active"></mat-slide-toggle>
        </mat-card>

        <mat-card class="add-card">
          <button mat-stroked-button><mat-icon>add</mat-icon> Ajouter un moyen de paiement</button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .methods-container { padding: 24px; max-width: 600px; h1 { margin: 0 0 8px; } p { color: #757575; margin: 0 0 24px; } }
    .methods-list { display: flex; flex-direction: column; gap: 12px; }
    .method-card { display: flex; align-items: center; gap: 16px; padding: 16px; .method-icon { width: 48px; height: 48px; background: #e3f2fd; border-radius: 8px; display: flex; align-items: center; justify-content: center; mat-icon { color: #1976d2; } } .method-info { flex: 1; .method-name { display: block; font-weight: 500; } .method-details { font-size: 13px; color: #757575; } } }
    .add-card { padding: 24px; text-align: center; button { width: 100%; } }
  `]
})
export class PaymentMethodsComponent {
  savedMethods = [
    { icon: 'phone_android', name: 'MTN Mobile Money', details: '6** *** **78', active: true },
    { icon: 'credit_card', name: 'Visa', details: '**** **** **** 4532', active: true }
  ];
}
