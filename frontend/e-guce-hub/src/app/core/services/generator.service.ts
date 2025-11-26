import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface GenerationJob {
  id: string;
  type: 'PROCEDURE' | 'ENTITY' | 'FRONTEND' | 'INFRASTRUCTURE';
  tenantId: string;
  tenantName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  output?: string;
}

export interface GenerateProcedureRequest {
  tenantId: string;
  procedureCode: string;
  procedureName: string;
  workflow: any;
  forms: any[];
  rules: any[];
  entities: any[];
}

export interface GenerateEntityRequest {
  tenantId: string;
  entityName: string;
  fields: {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
    indexed?: boolean;
  }[];
  relations: {
    name: string;
    type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
    targetEntity: string;
  }[];
  generateApi: boolean;
  generateUI: boolean;
}

export interface GenerateFrontendRequest {
  tenantId: string;
  componentType: 'LIST' | 'FORM' | 'DETAIL' | 'DASHBOARD';
  entityName: string;
  options: {
    pagination?: boolean;
    search?: boolean;
    export?: boolean;
    filters?: string[];
  };
}

export interface GenerateInfraRequest {
  tenantId: string;
  provider: string;
  region: string;
  options: {
    kubernetes: {
      version: string;
      nodeCount: number;
      machineType: string;
    };
    database: {
      type: string;
      version: string;
      size: string;
    };
    storage: {
      type: string;
      size: string;
    };
  };
  outputFormat: 'TERRAFORM' | 'HELM' | 'BOTH';
}

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/generator`;

  getDashboard(): Observable<{
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    recentJobs: GenerationJob[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  generateProcedure(request: GenerateProcedureRequest): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/procedures`, request);
  }

  generateEntity(request: GenerateEntityRequest): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/entities`, request);
  }

  generateFrontend(request: GenerateFrontendRequest): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/frontends`, request);
  }

  generateInfrastructure(request: GenerateInfraRequest): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/infrastructure`, request);
  }

  getJobStatus(jobId: string): Observable<GenerationJob> {
    return this.http.get<GenerationJob>(`${this.apiUrl}/jobs/${jobId}`);
  }

  getJobHistory(params?: { type?: string; status?: string; from?: Date; to?: Date }): Observable<GenerationJob[]> {
    return this.http.get<GenerationJob[]>(`${this.apiUrl}/history`, { params: params as any });
  }

  getQueue(): Observable<GenerationJob[]> {
    return this.http.get<GenerationJob[]>(`${this.apiUrl}/queue`);
  }

  cancelJob(jobId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/jobs/${jobId}/cancel`, {});
  }

  retryJob(jobId: string): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/jobs/${jobId}/retry`, {});
  }

  downloadOutput(jobId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/jobs/${jobId}/download`, { responseType: 'blob' });
  }
}
