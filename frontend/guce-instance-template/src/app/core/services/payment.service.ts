import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Payment models
export interface Payment {
  id: string;
  reference: string;
  declarationId?: string;
  declarationReference?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  fees: PaymentFee[];
  method: PaymentMethod;
  status: PaymentStatus;
  payer: {
    userId: string;
    userName: string;
    organizationId?: string;
    organizationName?: string;
  };
  provider?: {
    name: string;
    transactionId: string;
    response?: any;
  };
  initiatedAt: string;
  completedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface PaymentFee {
  code: string;
  label: string;
  amount: number;
  beneficiary: string;
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED'
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  minAmount?: number;
  maxAmount?: number;
  fees?: { type: 'fixed' | 'percentage'; value: number };
  providers: {
    id: string;
    name: string;
    logo: string;
  }[];
}

export interface PaymentInitRequest {
  declarationId?: string;
  invoiceId?: string;
  fees: { code: string; amount: number }[];
  method: PaymentMethod;
  providerId?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  paymentId: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  redirectUrl?: string;
  instructions?: string;
  expiresAt: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  paymentReference: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  fees: PaymentFee[];
  payer: {
    name: string;
    organization?: string;
    address?: string;
  };
  issuedAt: string;
  qrCode?: string;
  signature?: string;
}

export interface PaymentSearchParams extends QueryParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  declarationId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends BaseService<Payment> {
  constructor() {
    super(inject(HttpClient), environment.services.payments);
  }

  /**
   * Search payments with filters
   */
  search(params: PaymentSearchParams): Observable<PagedResponse<Payment>> {
    return this.getAll(params);
  }

  /**
   * Get payment by reference
   */
  getByReference(reference: string): Observable<Payment> {
    return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/reference/${reference}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get my payment history
   */
  getMyPayments(params?: QueryParams): Observable<PagedResponse<Payment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<Payment>>>(`${this.baseUrl}/me`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): Observable<PaymentMethodConfig[]> {
    return this.http.get<ApiResponse<PaymentMethodConfig[]>>(`${this.baseUrl}/methods`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Calculate fees for a declaration or invoice
   */
  calculateFees(data: { declarationId?: string; invoiceId?: string }): Observable<PaymentFee[]> {
    return this.http.post<ApiResponse<PaymentFee[]>>(`${this.baseUrl}/calculate-fees`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Initialize a new payment
   */
  initiate(request: PaymentInitRequest): Observable<PaymentInitResponse> {
    return this.http.post<ApiResponse<PaymentInitResponse>>(`${this.baseUrl}/initiate`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Confirm payment (for methods requiring confirmation)
   */
  confirm(paymentId: string, confirmationData?: any): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/${paymentId}/confirm`, confirmationData || {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancel pending payment
   */
  cancel(paymentId: string, reason?: string): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/${paymentId}/cancel`, { reason }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check payment status
   */
  checkStatus(paymentId: string): Observable<{ status: PaymentStatus; message?: string }> {
    return this.http.get<ApiResponse<{ status: PaymentStatus; message?: string }>>(`${this.baseUrl}/${paymentId}/status`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Request refund
   */
  requestRefund(paymentId: string, reason: string, amount?: number): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/${paymentId}/refund`, {
      reason,
      amount // partial refund if specified
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Receipts
  // ============================================

  /**
   * Get receipt for a payment
   */
  getReceipt(paymentId: string): Observable<Receipt> {
    return this.http.get<ApiResponse<Receipt>>(`${environment.api.baseUrl}${environment.services.receipts}/${paymentId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Download receipt as PDF
   */
  downloadReceiptPdf(paymentId: string): Observable<Blob> {
    return this.http.get(`${environment.api.baseUrl}${environment.services.receipts}/${paymentId}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Send receipt by email
   */
  sendReceiptByEmail(paymentId: string, email: string): Observable<void> {
    return this.http.post<void>(`${environment.api.baseUrl}${environment.services.receipts}/${paymentId}/send`, { email });
  }

  /**
   * Verify receipt authenticity
   */
  verifyReceipt(receiptNumber: string): Observable<{ valid: boolean; receipt?: Receipt }> {
    return this.http.get<ApiResponse<{ valid: boolean; receipt?: Receipt }>>(`${environment.api.baseUrl}${environment.services.receipts}/verify/${receiptNumber}`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Saved Payment Methods (User's)
  // ============================================

  /**
   * Get user's saved payment methods
   */
  getSavedMethods(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.api.baseUrl}${environment.services.paymentMethods}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Save a new payment method
   */
  saveMethod(method: { type: PaymentMethod; details: any; isDefault?: boolean }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.api.baseUrl}${environment.services.paymentMethods}`, method).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete saved payment method
   */
  deleteSavedMethod(methodId: string): Observable<void> {
    return this.http.delete<void>(`${environment.api.baseUrl}${environment.services.paymentMethods}/${methodId}`);
  }

  /**
   * Set default payment method
   */
  setDefaultMethod(methodId: string): Observable<void> {
    return this.http.put<void>(`${environment.api.baseUrl}${environment.services.paymentMethods}/${methodId}/default`, {});
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get payment statistics
   */
  getStats(period: { start: string; end: string }): Observable<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
    byMethod: { method: PaymentMethod; count: number; amount: number }[];
    byDay: { date: string; count: number; amount: number }[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`, {
      params: { startDate: period.start, endDate: period.end }
    }).pipe(
      map(response => response.data)
    );
  }
}
