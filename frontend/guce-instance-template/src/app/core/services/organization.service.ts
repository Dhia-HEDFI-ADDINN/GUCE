import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';
import { OrganizationType } from './user.service';

// Organization models
export interface Organization {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  type: OrganizationType;
  status: OrganizationStatus;
  niu?: string;         // Numéro d'Identification Unique
  rccm?: string;        // Registre du Commerce
  taxId?: string;
  contact: OrganizationContact;
  address: OrganizationAddress;
  legal?: OrganizationLegalInfo;
  banking?: BankingInfo;
  usersCount: number;
  declarationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationContact {
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

export interface OrganizationAddress {
  street: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OrganizationLegalInfo {
  legalForm: string;              // SARL, SA, etc.
  capital?: number;
  foundingDate?: string;
  activityCode?: string;
  documents: {
    type: string;
    number: string;
    issuedAt: string;
    expiresAt?: string;
    fileUrl?: string;
  }[];
}

export interface BankingInfo {
  bankName: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

export interface OrganizationSearchParams extends QueryParams {
  search?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  city?: string;
  hasNiu?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends BaseService<Organization> {
  constructor() {
    super(inject(HttpClient), environment.services.organizations);
  }

  /**
   * Search organizations with filters
   */
  search(params: OrganizationSearchParams): Observable<PagedResponse<Organization>> {
    return this.getAll(params);
  }

  /**
   * Get organization by code
   */
  getByCode(code: string): Observable<Organization> {
    return this.http.get<ApiResponse<Organization>>(`${this.baseUrl}/code/${code}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get organization by NIU
   */
  getByNiu(niu: string): Observable<Organization> {
    return this.http.get<ApiResponse<Organization>>(`${this.baseUrl}/niu/${niu}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Verify NIU with external system
   */
  verifyNiu(niu: string): Observable<{
    valid: boolean;
    organization?: {
      name: string;
      status: string;
      registrationDate: string;
    };
    message?: string;
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/verify-niu/${niu}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get organizations by type
   */
  getByType(type: OrganizationType, params?: QueryParams): Observable<PagedResponse<Organization>> {
    return this.search({ ...params, type });
  }

  /**
   * Get administrations only
   */
  getAdministrations(params?: QueryParams): Observable<PagedResponse<Organization>> {
    return this.getByType(OrganizationType.ADMINISTRATION, params);
  }

  /**
   * Get operators (enterprises)
   */
  getOperators(params?: QueryParams): Observable<PagedResponse<Organization>> {
    return this.getByType(OrganizationType.OPERATOR, params);
  }

  /**
   * Get intermediaries (transitaires, etc.)
   */
  getIntermediaries(params?: QueryParams): Observable<PagedResponse<Organization>> {
    return this.getByType(OrganizationType.INTERMEDIARY, params);
  }

  /**
   * Change organization status
   */
  changeStatus(orgId: string, status: OrganizationStatus, reason?: string): Observable<Organization> {
    return this.http.patch<ApiResponse<Organization>>(`${this.baseUrl}/${orgId}/status`, {
      status,
      reason
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get organization's users
   */
  getUsers(orgId: string, params?: QueryParams): Observable<PagedResponse<any>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(`${this.baseUrl}/${orgId}/users`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get organization's declarations
   */
  getDeclarations(orgId: string, params?: QueryParams): Observable<PagedResponse<any>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<any>>>(`${this.baseUrl}/${orgId}/declarations`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get organization statistics
   */
  getStats(orgId: string, period?: { start: string; end: string }): Observable<{
    declarations: { total: number; pending: number; approved: number; rejected: number };
    payments: { total: number; amount: number };
    users: { total: number; active: number };
    byMonth: { month: string; declarations: number; amount: number }[];
  }> {
    const params: any = {};
    if (period) {
      params.startDate = period.start;
      params.endDate = period.end;
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${orgId}/stats`, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Upload organization document
   */
  uploadDocument(orgId: string, file: File, metadata: { type: string; number: string; expiresAt?: string }): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${orgId}/documents`, formData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Export organizations
   */
  export(params?: OrganizationSearchParams, format: 'csv' | 'xlsx' = 'xlsx'): Observable<Blob> {
    const httpParams = this.buildParams({ ...params, format });
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
