import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Declaration,
  DeclarationSearchParams,
  DeclarationStats,
  DeclarationType
} from '../models/declaration.model';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/declarations`;

  // Get declarations with search/filter
  search(params: DeclarationSearchParams): Observable<{ data: Declaration[]; total: number }> {
    let httpParams = new HttpParams();
    if (params.reference) httpParams = httpParams.set('reference', params.reference);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate.toISOString());
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate.toISOString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<{ data: Declaration[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  // Get by type
  getByType(type: DeclarationType): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}/type/${type}`);
  }

  // Get single declaration
  getById(id: string): Observable<Declaration> {
    return this.http.get<Declaration>(`${this.apiUrl}/${id}`);
  }

  // Get by reference
  getByReference(reference: string): Observable<Declaration> {
    return this.http.get<Declaration>(`${this.apiUrl}/reference/${reference}`);
  }

  // Create draft
  createDraft(type: DeclarationType): Observable<Declaration> {
    return this.http.post<Declaration>(this.apiUrl, { type });
  }

  // Update declaration
  update(id: string, data: Partial<Declaration>): Observable<Declaration> {
    return this.http.put<Declaration>(`${this.apiUrl}/${id}`, data);
  }

  // Submit declaration
  submit(id: string): Observable<Declaration> {
    return this.http.post<Declaration>(`${this.apiUrl}/${id}/submit`, {});
  }

  // Delete draft
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Upload document
  uploadDocument(declarationId: string, file: File, documentType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);
    return this.http.post(`${this.apiUrl}/${declarationId}/documents`, formData);
  }

  // Get statistics
  getStats(): Observable<DeclarationStats> {
    return this.http.get<DeclarationStats>(`${this.apiUrl}/stats`);
  }

  // Get workflow history
  getWorkflowHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/workflow`);
  }

  // Calculate fees
  calculateFees(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/calculate-fees`, {});
  }

  // Initiate payment
  initiatePayment(id: string, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/pay`, { paymentMethod });
  }
}
