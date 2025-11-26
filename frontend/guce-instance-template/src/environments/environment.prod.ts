// Production Environment - Variables will be replaced during generation
export const environment = {
  production: true,

  // Instance Configuration (replaced by Generator)
  instance: {
    code: '{{INSTANCE_CODE}}',
    name: '{{INSTANCE_NAME}}',
    domain: '{{INSTANCE_DOMAIN}}',
    country: '{{INSTANCE_COUNTRY}}',
    countryCode: '{{INSTANCE_COUNTRY_CODE}}',
    currency: '{{INSTANCE_CURRENCY}}',
    locale: '{{INSTANCE_LOCALE}}',
    timezone: '{{INSTANCE_TIMEZONE}}'
  },

  // Branding (replaced by Generator)
  branding: {
    primaryColor: '{{PRIMARY_COLOR}}',
    secondaryColor: '{{SECONDARY_COLOR}}',
    accentColor: '{{ACCENT_COLOR}}',
    logo: 'assets/logo.png',
    favicon: 'assets/favicon.ico'
  },

  // API Gateway Configuration
  api: {
    baseUrl: 'https://api.{{INSTANCE_DOMAIN}}',
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
    url: 'https://auth.{{INSTANCE_DOMAIN}}',
    realm: '{{KEYCLOAK_REALM}}',
    clientId: '{{KEYCLOAK_CLIENT_ID}}',
    redirectUri: 'https://{{INSTANCE_DOMAIN}}',
    silentCheckSsoRedirectUri: 'https://{{INSTANCE_DOMAIN}}/assets/silent-check-sso.html',
    scope: 'openid profile email',
    responseType: 'code',
    refreshToken: {
      enabled: true,
      minValidity: 60,
      checkInterval: 30000
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
    allowedOrigins: ['https://{{INSTANCE_DOMAIN}}', 'https://api.{{INSTANCE_DOMAIN}}']
  },

  // Hub Communication
  hub: {
    url: 'https://e-guce-hub.com',
    enabled: true,
    apiKey: '{{HUB_API_KEY}}',
    telemetryInterval: 60000,
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
    url: 'wss://api.{{INSTANCE_DOMAIN}}/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },

  // Logging Configuration
  logging: {
    level: 'warn',
    console: false,
    remote: true,
    remoteUrl: '/api/v1/logs'
  },

  // Feature Flags
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
  }
};
