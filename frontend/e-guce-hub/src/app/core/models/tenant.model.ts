export interface Tenant {
  id: string;
  code: string;
  name: string;
  shortName: string;
  domain: string;
  country: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  locale: string;
  currency: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
  modules: TenantModule[];
  infrastructure: TenantInfrastructure;
  health?: TenantHealth;
}

export enum TenantStatus {
  PENDING = 'PENDING',
  PROVISIONING = 'PROVISIONING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export interface TenantModule {
  name: string;
  enabled: boolean;
  features: string[];
}

export interface TenantInfrastructure {
  provider: string;
  region: string;
  kubernetesVersion: string;
  nodeCount: number;
  databaseType: string;
  databaseSize: string;
  storageSize: string;
}

export interface TenantHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  lastCheck: Date;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime?: number;
  lastError?: string;
}

export interface TenantCreateRequest {
  tenant: {
    code: string;
    name: string;
    shortName: string;
    domain: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    timezone: string;
    locale: string;
    supportedLocales: string[];
    currency: string;
  };
  technical: {
    environment: string;
    highAvailability: boolean;
    autoScaling: {
      enabled: boolean;
      minReplicas: number;
      maxReplicas: number;
    };
    backup: {
      enabled: boolean;
      frequency: string;
      retention: number;
    };
  };
  modules: {
    eForce: { enabled: boolean; features: string[] };
    eGov: { enabled: boolean; features: string[] };
    eBusiness: { enabled: boolean; features: string[] };
    ePayment: { enabled: boolean; providers: string[] };
    procedureBuilder: { enabled: boolean; features: string[] };
    admin: { enabled: boolean; features: string[] };
  };
  initialAdmins: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tempPassword: boolean;
  }[];
  infrastructure: {
    provider: string;
    region: string;
    kubernetes: {
      version: string;
      nodePool: {
        machineType: string;
        nodeCount: number;
        autoScale: boolean;
      };
    };
    database: {
      type: string;
      version: string;
      size: string;
      replicas: number;
    };
    storage: {
      type: string;
      size: string;
    };
  };
}

export interface TenantMetrics {
  tenantId: string;
  cpu: {
    usage: number;
    limit: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  storage: {
    usage: number;
    limit: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
  transactions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  activeUsers: number;
  responseTime: number;
}

// Deployment Status for tracking provisioning
export interface DeploymentStatus {
  tenantId: string;
  status: 'PENDING' | 'PROVISIONING' | 'DEPLOYING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  steps: DeploymentStep[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface DeploymentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

// Hub Statistics
export interface HubStats {
  totalTenants: number;
  runningTenants: number;
  stoppedTenants: number;
  errorTenants: number;
  healthyTenants: number;
  degradedTenants: number;
  totalActiveUsers: number;
  totalTransactions: number;
  lastUpdated: Date;
}
