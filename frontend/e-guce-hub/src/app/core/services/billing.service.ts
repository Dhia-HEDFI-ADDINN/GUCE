import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Billing models
export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  period: {
    start: string;
    end: string;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata?: Record<string, any>;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface UsageMetrics {
  tenantId: string;
  tenantName: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    declarations: number;
    users: number;
    storage: number; // in GB
    apiCalls: number;
    transactions: number;
  };
  costs: {
    base: number;
    declarations: number;
    users: number;
    storage: number;
    apiCalls: number;
    transactions: number;
    total: number;
  };
}

export interface BillingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  pricing: {
    base: number;
    perDeclaration: number;
    perUser: number;
    perGbStorage: number;
    perApiCall: number;
    perTransaction: number;
  };
  limits: {
    declarations: number;
    users: number;
    storage: number;
    apiCalls: number;
  };
  features: string[];
  isDefault: boolean;
  isActive: boolean;
}

export interface BillingSearchParams extends QueryParams {
  tenantId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService extends BaseService<Invoice> {
  constructor() {
    super(inject(HttpClient), environment.services.billing);
  }

  /**
   * Search invoices with filters
   */
  searchInvoices(params: BillingSearchParams): Observable<PagedResponse<Invoice>> {
    return this.getAll(params);
  }

  /**
   * Get invoice by ID
   */
  getInvoice(invoiceId: string): Observable<Invoice> {
    return this.getById(invoiceId);
  }

  /**
   * Get invoices for a specific tenant
   */
  getTenantInvoices(tenantId: string, params?: QueryParams): Observable<PagedResponse<Invoice>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<Invoice>>>(`${this.baseUrl}/tenants/${tenantId}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Generate invoice for a tenant
   */
  generateInvoice(tenantId: string, period: { start: string; end: string }): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/generate`, {
      tenantId,
      period
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Mark invoice as paid
   */
  markAsPaid(invoiceId: string, paymentDetails: {
    paymentMethod: string;
    paymentReference: string;
    paidAt?: string;
  }): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/${invoiceId}/pay`, paymentDetails).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancel invoice
   */
  cancelInvoice(invoiceId: string, reason: string): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/${invoiceId}/cancel`, { reason }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Send invoice reminder
   */
  sendReminder(invoiceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${invoiceId}/remind`, {});
  }

  /**
   * Download invoice as PDF
   */
  downloadInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // Usage Metrics
  // ============================================

  /**
   * Get usage metrics for a tenant
   */
  getTenantUsage(tenantId: string, period: { start: string; end: string }): Observable<UsageMetrics> {
    return this.http.get<ApiResponse<UsageMetrics>>(`${this.baseUrl}/usage/${tenantId}`, {
      params: { startDate: period.start, endDate: period.end }
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get aggregated usage across all tenants
   */
  getGlobalUsage(period: { start: string; end: string }): Observable<UsageMetrics[]> {
    return this.http.get<ApiResponse<UsageMetrics[]>>(`${this.baseUrl}/usage`, {
      params: { startDate: period.start, endDate: period.end }
    }).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Billing Plans
  // ============================================

  /**
   * Get all billing plans
   */
  getPlans(): Observable<BillingPlan[]> {
    return this.http.get<ApiResponse<BillingPlan[]>>(`${this.baseUrl}/plans`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get billing plan by ID
   */
  getPlan(planId: string): Observable<BillingPlan> {
    return this.http.get<ApiResponse<BillingPlan>>(`${this.baseUrl}/plans/${planId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new billing plan
   */
  createPlan(plan: Omit<BillingPlan, 'id'>): Observable<BillingPlan> {
    return this.http.post<ApiResponse<BillingPlan>>(`${this.baseUrl}/plans`, plan).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update billing plan
   */
  updatePlan(planId: string, plan: Partial<BillingPlan>): Observable<BillingPlan> {
    return this.http.put<ApiResponse<BillingPlan>>(`${this.baseUrl}/plans/${planId}`, plan).pipe(
      map(response => response.data)
    );
  }

  /**
   * Assign billing plan to tenant
   */
  assignPlanToTenant(tenantId: string, planId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/tenants/${tenantId}/plan`, { planId });
  }

  // ============================================
  // Reports
  // ============================================

  /**
   * Get revenue summary
   */
  getRevenueSummary(period: { start: string; end: string }): Observable<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    byMonth: { month: string; amount: number }[];
    byTenant: { tenantId: string; tenantName: string; amount: number }[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/revenue`, {
      params: { startDate: period.start, endDate: period.end }
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Export billing report
   */
  exportReport(params: BillingSearchParams, format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'): Observable<Blob> {
    const httpParams = this.buildParams({ ...params, format });
    return this.http.get(`${this.baseUrl}/reports/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
