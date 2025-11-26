import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService, PagedResponse, QueryParams, ApiResponse } from './base.service';
import { environment } from '../../../environments/environment';

// Procedure models
export interface Procedure {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ProcedureCategory;
  type: ProcedureType;
  status: ProcedureStatus;
  version: string;
  config: ProcedureConfig;
  steps: ProcedureStep[];
  fees: ProcedureFee[];
  documents: ProcedureDocument[];
  sla: ProcedureSLA;
  administrations: string[]; // IDs of involved administrations
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProcedureConfig {
  requiresPayment: boolean;
  requiresSignature: boolean;
  allowDraft: boolean;
  allowAmendment: boolean;
  validityDays?: number;
  renewalEnabled: boolean;
  renewalDaysBefore?: number;
  autoApproval: boolean;
  autoApprovalConditions?: string[];
}

export interface ProcedureStep {
  id: string;
  order: number;
  name: string;
  description: string;
  type: StepType;
  assignee: StepAssignee;
  actions: StepAction[];
  transitions: StepTransition[];
  timeout?: number; // in hours
  escalation?: {
    afterHours: number;
    to: string;
    notifyRoles: string[];
  };
  formConfig?: {
    fields: FormField[];
    validations: any[];
  };
}

export enum StepType {
  START = 'START',
  USER_TASK = 'USER_TASK',
  SERVICE_TASK = 'SERVICE_TASK',
  APPROVAL = 'APPROVAL',
  PARALLEL_GATEWAY = 'PARALLEL_GATEWAY',
  EXCLUSIVE_GATEWAY = 'EXCLUSIVE_GATEWAY',
  NOTIFICATION = 'NOTIFICATION',
  PAYMENT = 'PAYMENT',
  END = 'END'
}

export interface StepAssignee {
  type: 'ROLE' | 'USER' | 'ORGANIZATION' | 'DYNAMIC';
  value: string;
  fallback?: string;
}

export interface StepAction {
  id: string;
  name: string;
  type: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD' | 'COMPLETE' | 'CUSTOM';
  icon?: string;
  requiresComment: boolean;
  requiresDocument: boolean;
  nextStepId?: string;
}

export interface StepTransition {
  from: string;
  to: string;
  condition?: string;
  action: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'textarea' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: { value: string; label: string }[];
  dependsOn?: { field: string; value: any };
}

export interface ProcedureFee {
  code: string;
  name: string;
  amount: number;
  currency: string;
  type: 'FIXED' | 'PERCENTAGE' | 'CALCULATED';
  calculation?: string;
  beneficiary: string;
  mandatory: boolean;
}

export interface ProcedureDocument {
  code: string;
  name: string;
  description?: string;
  mandatory: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
  template?: string;
  validationRules?: string[];
}

export interface ProcedureSLA {
  targetDays: number;
  warningDays: number;
  criticalDays: number;
  escalationPolicy: {
    level: number;
    afterDays: number;
    notifyRoles: string[];
  }[];
}

export enum ProcedureCategory {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TRANSIT = 'TRANSIT',
  CUSTOMS = 'CUSTOMS',
  PERMITS = 'PERMITS',
  CERTIFICATES = 'CERTIFICATES',
  OTHER = 'OTHER'
}

export enum ProcedureType {
  DECLARATION = 'DECLARATION',
  REQUEST = 'REQUEST',
  CERTIFICATE = 'CERTIFICATE',
  PERMIT = 'PERMIT',
  APPROVAL = 'APPROVAL'
}

export enum ProcedureStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED'
}

export interface ProcedureSearchParams extends QueryParams {
  search?: string;
  category?: ProcedureCategory;
  type?: ProcedureType;
  status?: ProcedureStatus;
}

@Injectable({
  providedIn: 'root'
})
export class ProcedureService extends BaseService<Procedure> {
  constructor() {
    super(inject(HttpClient), environment.services.procedures);
  }

  /**
   * Search procedures
   */
  search(params: ProcedureSearchParams): Observable<PagedResponse<Procedure>> {
    return this.getAll(params);
  }

  /**
   * Get procedure by code
   */
  getByCode(code: string): Observable<Procedure> {
    return this.http.get<ApiResponse<Procedure>>(`${this.baseUrl}/code/${code}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get procedures by category
   */
  getByCategory(category: ProcedureCategory): Observable<Procedure[]> {
    return this.http.get<ApiResponse<Procedure[]>>(`${this.baseUrl}/category/${category}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get published procedures only (for operators)
   */
  getPublished(params?: QueryParams): Observable<PagedResponse<Procedure>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<Procedure>>>(`${this.baseUrl}/published`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Start a new declaration based on procedure
   */
  startDeclaration(procedureId: string): Observable<{ declarationId: string; reference: string }> {
    return this.http.post<ApiResponse<{ declarationId: string; reference: string }>>(`${this.baseUrl}/${procedureId}/start`, {}).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Workflow Operations (for agents)
  // ============================================

  /**
   * Get pending tasks in my inbox
   */
  getMyTasks(params?: QueryParams): Observable<PagedResponse<WorkflowTask>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedResponse<WorkflowTask>>>(`${environment.api.baseUrl}${environment.services.inbox}`, {
      params: httpParams
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get task details
   */
  getTaskById(taskId: string): Observable<WorkflowTask> {
    return this.http.get<ApiResponse<WorkflowTask>>(`${environment.api.baseUrl}${environment.services.inbox}/${taskId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Claim a task
   */
  claimTask(taskId: string): Observable<WorkflowTask> {
    return this.http.post<ApiResponse<WorkflowTask>>(`${environment.api.baseUrl}${environment.services.inbox}/${taskId}/claim`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Unclaim a task
   */
  unclaimTask(taskId: string): Observable<WorkflowTask> {
    return this.http.post<ApiResponse<WorkflowTask>>(`${environment.api.baseUrl}${environment.services.inbox}/${taskId}/unclaim`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Complete task with action
   */
  completeTask(taskId: string, data: {
    action: string;
    comment?: string;
    formData?: Record<string, any>;
    documents?: string[];
  }): Observable<WorkflowTask> {
    return this.http.post<ApiResponse<WorkflowTask>>(`${environment.api.baseUrl}${environment.services.inbox}/${taskId}/complete`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Forward task to another user/role
   */
  forwardTask(taskId: string, to: { type: 'USER' | 'ROLE'; id: string }, comment?: string): Observable<WorkflowTask> {
    return this.http.post<ApiResponse<WorkflowTask>>(`${environment.api.baseUrl}${environment.services.inbox}/${taskId}/forward`, {
      to,
      comment
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get task history
   */
  getTaskHistory(declarationId: string): Observable<TaskHistoryEntry[]> {
    return this.http.get<ApiResponse<TaskHistoryEntry[]>>(`${environment.api.baseUrl}${environment.services.processing}/${declarationId}/history`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Decision/Approval
  // ============================================

  /**
   * Make a decision on a declaration
   */
  makeDecision(declarationId: string, decision: {
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SUSPEND';
    comment: string;
    conditions?: string[];
    validUntil?: string;
  }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.api.baseUrl}${environment.services.decisions}/${declarationId}`, decision).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get decision history
   */
  getDecisionHistory(declarationId: string): Observable<DecisionEntry[]> {
    return this.http.get<ApiResponse<DecisionEntry[]>>(`${environment.api.baseUrl}${environment.services.decisions}/${declarationId}/history`).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get procedure statistics
   */
  getProcedureStats(procedureId: string, period?: { start: string; end: string }): Observable<ProcedureStats> {
    const params: any = {};
    if (period) {
      params.startDate = period.start;
      params.endDate = period.end;
    }
    return this.http.get<ApiResponse<ProcedureStats>>(`${this.baseUrl}/${procedureId}/stats`, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get SLA compliance report
   */
  getSLAReport(params?: { procedureId?: string; startDate?: string; endDate?: string }): Observable<SLAReport> {
    return this.http.get<ApiResponse<SLAReport>>(`${this.baseUrl}/sla-report`, { params: params as any }).pipe(
      map(response => response.data)
    );
  }
}

// ============================================
// Additional interfaces
// ============================================

export interface WorkflowTask {
  id: string;
  declarationId: string;
  declarationReference: string;
  procedureId: string;
  procedureName: string;
  stepId: string;
  stepName: string;
  status: 'PENDING' | 'CLAIMED' | 'COMPLETED' | 'ESCALATED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignee?: {
    type: 'USER' | 'ROLE';
    id: string;
    name: string;
  };
  claimedBy?: {
    userId: string;
    userName: string;
    claimedAt: string;
  };
  availableActions: StepAction[];
  formConfig?: any;
  declarationData: Record<string, any>;
  documents: any[];
  dueDate?: string;
  slaStatus: 'ON_TIME' | 'WARNING' | 'CRITICAL' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  stepName: string;
  action: string;
  performedBy: {
    userId: string;
    userName: string;
    role: string;
  };
  comment?: string;
  previousStatus: string;
  newStatus: string;
  duration: number; // in minutes
  performedAt: string;
}

export interface DecisionEntry {
  id: string;
  declarationId: string;
  decision: string;
  madeBy: {
    userId: string;
    userName: string;
    role: string;
    organization: string;
  };
  comment: string;
  conditions?: string[];
  validUntil?: string;
  madeAt: string;
}

export interface ProcedureStats {
  total: number;
  byStatus: { status: string; count: number }[];
  avgProcessingDays: number;
  slaCompliance: number;
  byMonth: { month: string; submitted: number; completed: number }[];
}

export interface SLAReport {
  period: { start: string; end: string };
  overall: {
    total: number;
    onTime: number;
    delayed: number;
    complianceRate: number;
  };
  byProcedure: {
    procedureId: string;
    procedureName: string;
    total: number;
    onTime: number;
    avgDays: number;
    targetDays: number;
  }[];
  byAdministration: {
    administrationId: string;
    administrationName: string;
    total: number;
    onTime: number;
    avgDays: number;
  }[];
}
