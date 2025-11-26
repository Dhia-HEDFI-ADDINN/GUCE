export interface Declaration {
  id: string;
  reference: string;
  type: DeclarationType;
  status: DeclarationStatus;
  regime: string;

  // Parties
  declarant: Party;
  importerExporter: Party;

  // Goods
  goods: GoodsItem[];
  totalValue: number;
  currency: string;

  // Documents
  documents: DocumentRef[];

  // Workflow
  currentStep: string;
  workflowHistory: WorkflowStep[];

  // Dates
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  validatedAt?: Date;

  // Payments
  fees: Fee[];
  totalFees: number;
  paymentStatus: PaymentStatus;
}

export enum DeclarationType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TRANSIT = 'TRANSIT',
  TEMPORARY = 'TEMPORARY'
}

export enum DeclarationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  IN_PROCESS = 'IN_PROCESS',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  PENDING_INSPECTION = 'PENDING_INSPECTION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export interface Party {
  id: string;
  name: string;
  taxId: string;
  address: string;
  country: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface GoodsItem {
  id: string;
  lineNumber: number;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  weight: number;
  value: number;
  origin: string;
  documents: string[];
}

export interface DocumentRef {
  id: string;
  type: string;
  name: string;
  reference: string;
  url: string;
  uploadedAt: Date;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface WorkflowStep {
  step: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  actor?: string;
  action?: string;
  comment?: string;
  timestamp?: Date;
}

export interface Fee {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface DeclarationSearchParams {
  reference?: string;
  type?: DeclarationType;
  status?: DeclarationStatus;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  size?: number;
}

export interface DeclarationStats {
  total: number;
  draft: number;
  submitted: number;
  inProcess: number;
  approved: number;
  rejected: number;
  pendingPayment: number;
}
