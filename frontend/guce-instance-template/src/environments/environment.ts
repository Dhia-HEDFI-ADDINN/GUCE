// Environment template - Variables will be replaced during generation
export const environment = {
  production: false,

  // Instance Configuration (replaced by Generator)
  instance: {
    code: '{{INSTANCE_CODE}}',           // e.g., 'CM', 'TD', 'CF'
    name: '{{INSTANCE_NAME}}',           // e.g., 'GUCE Cameroun'
    domain: '{{INSTANCE_DOMAIN}}',       // e.g., 'guce-cameroun.com'
    country: '{{INSTANCE_COUNTRY}}',     // e.g., 'Cameroun'
    countryCode: '{{INSTANCE_COUNTRY_CODE}}', // e.g., 'CM'
    currency: '{{INSTANCE_CURRENCY}}',   // e.g., 'XAF'
    locale: '{{INSTANCE_LOCALE}}',       // e.g., 'fr-CM'
    timezone: '{{INSTANCE_TIMEZONE}}'    // e.g., 'Africa/Douala'
  },

  // Branding (replaced by Generator)
  branding: {
    primaryColor: '{{PRIMARY_COLOR}}',     // e.g., '#1E5631'
    secondaryColor: '{{SECONDARY_COLOR}}', // e.g., '#CE1126'
    accentColor: '{{ACCENT_COLOR}}',       // e.g., '#FCD116'
    logo: 'assets/logo.png',
    favicon: 'assets/favicon.ico'
  },

  // API Gateway Configuration
  api: {
    baseUrl: 'http://localhost:8081',      // Instance Gateway
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Microservices Endpoints (via Instance Gateway)
  services: {
    // e-Force Module
    declarations: '/api/v1/declarations',
    procedures: '/api/v1/procedures',
    documents: '/api/v1/documents',

    // e-Gov Module
    processing: '/api/v1/processing',
    decisions: '/api/v1/decisions',
    inbox: '/api/v1/inbox',

    // e-Business Module
    clients: '/api/v1/clients',
    billing: '/api/v1/billing',
    invoices: '/api/v1/invoices',

    // e-Payment Module
    payments: '/api/v1/payments',
    receipts: '/api/v1/receipts',
    paymentMethods: '/api/v1/payment-methods',

    // Procedure Builder Module
    procedureConfig: '/api/v1/procedure-config',
    workflows: '/api/v1/workflows',
    forms: '/api/v1/forms',
    rules: '/api/v1/rules',
    referentials: '/api/v1/referentials',
    integrations: '/api/v1/integrations',

    // Admin Module
    users: '/api/v1/users',
    roles: '/api/v1/roles',
    organizations: '/api/v1/organizations',
    audit: '/api/v1/audit',
    monitoring: '/api/v1/monitoring',
    settings: '/api/v1/settings',

    // Common
    notifications: '/api/v1/notifications',
    reports: '/api/v1/reports',
    files: '/api/v1/files'
  },

  // Keycloak Configuration (Single Client for Instance)
  keycloak: {
    url: 'http://localhost:8180',
    realm: '{{KEYCLOAK_REALM}}',           // e.g., 'guce-cameroun'
    clientId: '{{KEYCLOAK_CLIENT_ID}}',    // e.g., 'guce-cameroun' (same as realm)
    redirectUri: 'http://localhost:4200',
    silentCheckSsoRedirectUri: 'http://localhost:4200/assets/silent-check-sso.html',
    scope: 'openid profile email',
    responseType: 'code',
    refreshToken: {
      enabled: true,
      minValidity: 30,
      checkInterval: 10000
    }
  },

  // Security Configuration
  security: {
    csrf: {
      enabled: true,
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    },
    csp: {
      enabled: true
    },
    allowedOrigins: ['http://localhost:4200', 'http://localhost:8081']
  },

  // Hub Communication (for telemetry and monitoring)
  hub: {
    url: 'https://e-guce-hub.com',
    enabled: true,
    apiKey: '{{HUB_API_KEY}}',
    telemetryInterval: 60000,  // Send telemetry every minute
    endpoints: {
      telemetry: '/api/v1/telemetry',
      health: '/api/v1/health/report',
      alerts: '/api/v1/alerts'
    }
  },

  // External Integrations
  externalServices: {
    banking: {
      url: '{{BANKING_API_URL}}',
      timeout: 60000
    },
    customs: {
      url: '{{CUSTOMS_API_URL}}',
      timeout: 60000
    },
    port: {
      url: '{{PORT_API_URL}}',
      timeout: 30000
    },
    sms: {
      url: '{{SMS_API_URL}}',
      timeout: 10000
    }
  },

  // WebSocket Configuration
  websocket: {
    url: 'ws://localhost:8081/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },

  // Logging Configuration
  logging: {
    level: 'debug',
    console: true,
    remote: false,
    remoteUrl: '/api/v1/logs'
  },

  // Feature Flags (can be overridden per instance)
  features: {
    eForce: true,
    eGov: true,
    eBusiness: true,
    ePayment: true,
    procedureBuilder: true,
    admin: true,
    notifications: true,
    reports: true,
    mobileApp: false,
    offlineMode: false
  },

  // ================================================
  // INTEGRATED TOOLS - Interface Unique
  // All tools accessible through the Instance single URL
  // ================================================
  tools: {
    // Camunda - Workflow Engine (BPM)
    camunda: {
      enabled: true,
      url: 'http://localhost:8083',
      proxyPath: '/tools/camunda',
      // Camunda Web Apps embedded in Instance
      cockpit: {
        enabled: true,
        path: '/camunda/app/cockpit',
        proxyPath: '/tools/camunda/cockpit'
      },
      tasklist: {
        enabled: true,
        path: '/camunda/app/tasklist',
        proxyPath: '/tools/camunda/tasklist'
      },
      admin: {
        enabled: true,
        path: '/camunda/app/admin',
        proxyPath: '/tools/camunda/admin'
      },
      // REST API for workflow integration
      restApi: '/engine-rest'
    },

    // Drools - Business Rules Engine
    drools: {
      enabled: true,
      url: 'http://localhost:8084',
      proxyPath: '/tools/drools',
      // Drools Workbench (Business Central)
      workbench: {
        enabled: true,
        path: '/business-central',
        proxyPath: '/tools/drools/workbench'
      },
      // KIE Server REST API
      kieServer: {
        url: 'http://localhost:8085',
        path: '/kie-server/services/rest',
        proxyPath: '/tools/kie-server'
      },
      // Rule containers
      containers: {
        procedures: '{{INSTANCE_CODE}}-procedures',
        validations: '{{INSTANCE_CODE}}-validations',
        fees: '{{INSTANCE_CODE}}-fees',
        routing: '{{INSTANCE_CODE}}-routing'
      }
    },

    // Grafana - Monitoring & Dashboards
    grafana: {
      enabled: true,
      url: 'http://localhost:3000',
      proxyPath: '/tools/grafana',
      embedPath: '/d-solo',
      defaultDashboard: 'instance-overview',
      dashboards: {
        overview: 'instance-overview',
        declarations: 'declarations-stats',
        workflow: 'workflow-performance',
        payments: 'payments-dashboard',
        sla: 'sla-compliance'
      }
    },

    // Kibana - Logs & Analytics
    kibana: {
      enabled: true,
      url: 'http://localhost:5601',
      proxyPath: '/tools/kibana',
      defaultIndex: '{{INSTANCE_CODE}}-logs-*',
      indexes: {
        applicationLogs: '{{INSTANCE_CODE}}-logs-*',
        auditLogs: '{{INSTANCE_CODE}}-audit-*',
        accessLogs: '{{INSTANCE_CODE}}-access-*',
        workflowLogs: '{{INSTANCE_CODE}}-workflow-*'
      }
    },

    // Elasticsearch - Search & Analytics API
    elasticsearch: {
      enabled: true,
      url: 'http://localhost:9200',
      proxyPath: '/tools/elasticsearch'
    },

    // Keycloak Admin Console
    keycloakAdmin: {
      enabled: true,
      url: 'http://localhost:8180/admin',
      proxyPath: '/tools/keycloak-admin',
      realm: '{{KEYCLOAK_REALM}}'
    },

    // Prometheus (metrics)
    prometheus: {
      enabled: true,
      url: 'http://localhost:9090',
      proxyPath: '/tools/prometheus'
    },

    // Jaeger (tracing)
    jaeger: {
      enabled: true,
      url: 'http://localhost:16686',
      proxyPath: '/tools/jaeger'
    },

    // Swagger/OpenAPI Documentation
    swagger: {
      enabled: true,
      url: 'http://localhost:8081/swagger-ui.html',
      proxyPath: '/tools/api-docs'
    },

    // Document Preview/Editor
    documentViewer: {
      enabled: true,
      supportedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg'],
      maxFileSize: 50 * 1024 * 1024  // 50MB
    },

    // Report Generator
    reportGenerator: {
      enabled: true,
      proxyPath: '/tools/reports',
      formats: ['pdf', 'xlsx', 'csv', 'html']
    }
  },

  // Tool Access Roles
  toolsAccess: {
    // Camunda access by user type
    camundaCockpit: ['instance-admin', 'supervisor'],
    camundaTasklist: ['agent', 'supervisor', 'instance-admin'],
    camundaAdmin: ['instance-admin'],
    // Drools access
    droolsWorkbench: ['instance-admin', 'rules-admin'],
    // Monitoring tools
    grafana: ['instance-admin', 'supervisor', 'monitoring-viewer'],
    kibana: ['instance-admin', 'log-viewer'],
    keycloakAdmin: ['instance-admin'],
    prometheus: ['instance-admin'],
    jaeger: ['instance-admin', 'developer'],
    swagger: ['instance-admin', 'developer'],
    // Document tools
    documentViewer: ['operator', 'agent', 'supervisor', 'instance-admin'],
    reportGenerator: ['supervisor', 'instance-admin']
  },

  // Procedure Builder Tools Configuration
  procedureBuilder: {
    // BPMN Modeler (embedded Camunda Modeler)
    bpmnModeler: {
      enabled: true,
      proxyPath: '/tools/bpmn-modeler'
    },
    // DMN Decision Tables Editor
    dmnEditor: {
      enabled: true,
      proxyPath: '/tools/dmn-editor'
    },
    // Form Builder
    formBuilder: {
      enabled: true,
      proxyPath: '/tools/form-builder',
      fieldTypes: [
        'text', 'textarea', 'number', 'date', 'datetime',
        'select', 'multiselect', 'checkbox', 'radio',
        'file', 'signature', 'location', 'niu-lookup'
      ]
    },
    // Fee Calculator Designer
    feeCalculator: {
      enabled: true,
      proxyPath: '/tools/fee-calculator'
    }
  }
};
