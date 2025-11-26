import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

// Paginated response
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Query parameters for pagination and filtering
export interface QueryParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Base service providing common HTTP operations for Instance services
 * with automatic retry, error handling, and response unwrapping
 */
export abstract class BaseService<T> {
  protected readonly baseUrl: string;
  protected readonly defaultHeaders: HttpHeaders;

  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {
    this.baseUrl = `${environment.api.baseUrl}${endpoint}`;
    this.defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Instance-Code': environment.instance.code
    });
  }

  /**
   * GET all items with optional pagination and filters
   */
  getAll(params?: QueryParams): Observable<PagedResponse<T>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<T>>>(this.baseUrl, {
      headers: this.defaultHeaders,
      params: httpParams
    }).pipe(
      retry({ count: environment.api.retryAttempts, delay: environment.api.retryDelay }),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * GET single item by ID
   */
  getById(id: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`, {
      headers: this.defaultHeaders
    }).pipe(
      retry({ count: environment.api.retryAttempts, delay: environment.api.retryDelay }),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * POST create new item
   */
  create(item: Partial<T>): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.baseUrl, item, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * PUT update existing item
   */
  update(id: string, item: Partial<T>): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, item, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH partial update
   */
  patch(id: string, item: Partial<T>): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${id}`, item, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE item by ID
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build HttpParams from QueryParams object
   */
  protected buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return httpParams;
  }

  /**
   * Centralized error handling
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Session expirée - veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas les droits nécessaires pour cette action';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflit de données';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.statusText}`;
      }
    }

    console.error('API Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      details: error.error
    }));
  };
}
