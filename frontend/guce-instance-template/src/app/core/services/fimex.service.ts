import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { BaseService, ApiResponse, PagedResponse, QueryParams } from './base.service';
import {
  InscriptionFIMEX,
  CreateInscriptionRequest,
  RenewInscriptionRequest,
  AmendInscriptionRequest,
  ApprovalRequest,
  RejectionRequest,
  ValidationResponse,
  FIMEXSearchParams,
  FIMEXStats,
  PieceJointe,
  TypeDocument,
  StatutFIMEX,
  EvenementFIMEX,
  RegionCameroun,
  SecteurActivite,
  CentreImpots
} from '../models/fimex.model';

/**
 * Service pour la gestion des inscriptions FIMEX
 * Fichier des Importateurs et Exportateurs - MINCOMMERCE
 */
@Injectable({
  providedIn: 'root'
})
export class FimexService extends BaseService<InscriptionFIMEX> {

  constructor(http: HttpClient) {
    super(http, '/api/v1/fimex');
  }

  // =====================================
  // INSCRIPTIONS CRUD
  // =====================================

  /**
   * Créer une nouvelle inscription FIMEX
   */
  createInscription(request: CreateInscriptionRequest): Observable<InscriptionFIMEX> {
    return this.http.post<ApiResponse<InscriptionFIMEX>>(`${this.baseUrl}/inscriptions`, request, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer une inscription par numéro FIMEX
   */
  getInscriptionByNumero(numeroFIMEX: string): Observable<InscriptionFIMEX> {
    return this.http.get<ApiResponse<InscriptionFIMEX>>(`${this.baseUrl}/inscriptions/${numeroFIMEX}`, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Rechercher des inscriptions avec filtres
   */
  searchInscriptions(params: FIMEXSearchParams): Observable<PagedResponse<InscriptionFIMEX>> {
    const httpParams = this.buildParams(params as QueryParams);
    return this.http.get<ApiResponse<PagedResponse<InscriptionFIMEX>>>(`${this.baseUrl}/inscriptions`, {
      headers: this.defaultHeaders,
      params: httpParams
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir mes inscriptions (opérateur connecté)
   */
  getMyInscriptions(): Observable<InscriptionFIMEX[]> {
    return this.http.get<ApiResponse<InscriptionFIMEX[]>>(`${this.baseUrl}/inscriptions/my`, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour une inscription (brouillon)
   */
  updateInscription(numeroFIMEX: string, data: Partial<InscriptionFIMEX>): Observable<InscriptionFIMEX> {
    return this.http.put<ApiResponse<InscriptionFIMEX>>(`${this.baseUrl}/inscriptions/${numeroFIMEX}`, data, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Soumettre une inscription
   */
  submitInscription(numeroFIMEX: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/inscriptions/${numeroFIMEX}/submit`, {}, {
      headers: this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================
  // RENOUVELLEMENT
  // =====================================

  /**
   * Renouveler une inscription FIMEX
   */
  renewInscription(numeroFIMEX: string, request: RenewInscriptionRequest): Observable<InscriptionFIMEX> {
    return this.http.post<ApiResponse<InscriptionFIMEX>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/renew`,
      request,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Vérifier l'éligibilité au renouvellement
   */
  checkRenewalEligibility(numeroFIMEX: string): Observable<{ eligible: boolean; message: string; joursRestants: number }> {
    return this.http.get<ApiResponse<{ eligible: boolean; message: string; joursRestants: number }>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/renewal-eligibility`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // AMENDEMENT
  // =====================================

  /**
   * Créer une demande d'amendement
   */
  amendInscription(numeroFIMEX: string, request: AmendInscriptionRequest): Observable<InscriptionFIMEX> {
    return this.http.post<ApiResponse<InscriptionFIMEX>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/amend`,
      request,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // VALIDATION FIMEX
  // =====================================

  /**
   * Valider un numéro FIMEX (endpoint public)
   */
  validateFimex(numeroFIMEX: string): Observable<ValidationResponse> {
    return this.http.get<ApiResponse<ValidationResponse>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/validate`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // DOCUMENTS
  // =====================================

  /**
   * Ajouter un document à une inscription
   */
  uploadDocument(numeroFIMEX: string, file: File, typeDocument: TypeDocument): Observable<PieceJointe> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('typeDocument', typeDocument);

    return this.http.post<ApiResponse<PieceJointe>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/documents`,
      formData
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un document
   */
  deleteDocument(numeroFIMEX: string, documentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/documents/${documentId}`,
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Télécharger un document
   */
  downloadDocument(numeroFIMEX: string, documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/documents/${documentId}/download`,
      { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================
  // PAIEMENT
  // =====================================

  /**
   * Initier un paiement pour inscription/renouvellement
   */
  initiatePayment(numeroFIMEX: string): Observable<{ paymentUrl: string; reference: string }> {
    return this.http.post<ApiResponse<{ paymentUrl: string; reference: string }>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/payment/initiate`,
      {},
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Vérifier le statut du paiement
   */
  checkPaymentStatus(numeroFIMEX: string): Observable<{ paid: boolean; reference?: string; datePaiement?: Date }> {
    return this.http.get<ApiResponse<{ paid: boolean; reference?: string; datePaiement?: Date }>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/payment/status`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // ADMINISTRATION (MINCOMMERCE)
  // =====================================

  /**
   * Approuver une inscription
   */
  approveInscription(numeroFIMEX: string, request: ApprovalRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/approve`,
      request,
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Rejeter une inscription
   */
  rejectInscription(numeroFIMEX: string, request: RejectionRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/reject`,
      request,
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Demander des documents complémentaires
   */
  requestDocuments(numeroFIMEX: string, documentsManquants: TypeDocument[], commentaire: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/request-documents`,
      { documentsManquants, commentaire },
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Suspendre une inscription
   */
  suspendInscription(numeroFIMEX: string, motif: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/suspend`,
      { motif },
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Réactiver une inscription suspendue
   */
  reactivateInscription(numeroFIMEX: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/reactivate`,
      {},
      { headers: this.defaultHeaders }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================
  // HISTORIQUE
  // =====================================

  /**
   * Obtenir l'historique d'une inscription
   */
  getHistorique(numeroFIMEX: string): Observable<EvenementFIMEX[]> {
    return this.http.get<ApiResponse<EvenementFIMEX[]>>(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/historique`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // STATISTIQUES
  // =====================================

  /**
   * Obtenir les statistiques FIMEX
   */
  getStats(): Observable<FIMEXStats> {
    return this.http.get<ApiResponse<FIMEXStats>>(
      `${this.baseUrl}/stats`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les inscriptions arrivant à expiration
   */
  getExpiringInscriptions(joursAvantExpiration: number = 30): Observable<InscriptionFIMEX[]> {
    return this.http.get<ApiResponse<InscriptionFIMEX[]>>(
      `${this.baseUrl}/inscriptions/expiring`,
      {
        headers: this.defaultHeaders,
        params: new HttpParams().set('days', joursAvantExpiration.toString())
      }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // =====================================
  // CERTIFICAT
  // =====================================

  /**
   * Télécharger le certificat FIMEX
   */
  downloadCertificat(numeroFIMEX: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/inscriptions/${numeroFIMEX}/certificat`,
      { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================
  // DONNÉES DE RÉFÉRENCE
  // =====================================

  /**
   * Obtenir la liste des régions
   */
  getRegions(): Observable<RegionCameroun[]> {
    return this.http.get<ApiResponse<RegionCameroun[]>>(
      `${this.baseUrl}/referentials/regions`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les secteurs d'activité
   */
  getSecteursActivite(): Observable<SecteurActivite[]> {
    return this.http.get<ApiResponse<SecteurActivite[]>>(
      `${this.baseUrl}/referentials/secteurs-activite`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les centres d'impôts
   */
  getCentresImpots(): Observable<CentreImpots[]> {
    return this.http.get<ApiResponse<CentreImpots[]>>(
      `${this.baseUrl}/referentials/centres-impots`,
      { headers: this.defaultHeaders }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
