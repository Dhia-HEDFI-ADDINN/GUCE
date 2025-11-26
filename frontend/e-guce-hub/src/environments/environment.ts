export const environment = {
  production: false,

  // Hub Identification
  hub: {
    name: 'E-GUCE 3G Generator Hub',
    version: '1.0.0',
    description: 'Plateforme centrale de génération et supervision des instances GUCE'
  },

  // API Gateway Configuration
  api: {
    baseUrl: 'http://localhost:8080',
    version: 'v1',
    timeout: 30000,       // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000      // 1 second
  },

  // Microservices Endpoints (via Gateway)
  services: {
    tenants: '/api/v1/tenants',
    generator: '/api/v1/generator',
    monitoring: '/api/v1/monitoring',
    users: '/api/v1/users',
    roles: '/api/v1/roles',
    organizations: '/api/v1/organizations',
    audit: '/api/v1/audit',
    billing: '/api/v1/billing',
    templates: '/api/v1/templates',
    settings: '/api/v1/settings',
    notifications: '/api/v1/notifications'
  },

  // Keycloak Configuration (Single Client for Hub)
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'e-guce-hub',
    clientId: 'e-guce-hub',
    redirectUri: 'http://localhost:4200',
    silentCheckSsoRedirectUri: 'http://localhost:4200/assets/silent-check-sso.html',
    scope: 'openid profile email',
    responseType: 'code',
    // Token refresh configuration
    refreshToken: {
      enabled: true,
      minValidity: 30,        // Refresh if less than 30 seconds remaining
      checkInterval: 10000    // Check every 10 seconds
    }
  },

  // Security Configuration
  security: {
    // CSRF Protection
    csrf: {
      enabled: true,
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    },
    // Content Security Policy headers
    csp: {
      enabled: true
    },
    // Allowed origins for CORS preflight
    allowedOrigins: ['http://localhost:4200', 'http://localhost:8080']
  },

  // WebSocket Configuration (for real-time monitoring)
  websocket: {
    url: 'ws://localhost:8080/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },

  // Logging Configuration
  logging: {
    level: 'debug',        // debug, info, warn, error
    console: true,
    remote: false,
    remoteUrl: '/api/v1/logs'
  },

  // Feature Flags
  features: {
    generator: true,
    monitoring: true,
    billing: true,
    templates: true,
    marketplace: true,
    multiRegion: false,
    advancedAnalytics: false
  },

  // ================================================
  // INTEGRATED TOOLS - Interface Unique
  // All tools accessible through the Hub single URL
  // ================================================
  tools: {
    // Grafana - Monitoring & Dashboards
    grafana: {
      enabled: true,
      url: 'http://localhost:3000',
      embedPath: '/d-solo',                    // For embedded dashboards
      proxyPath: '/tools/grafana',             // Proxied through gateway
      defaultDashboard: 'hub-overview',
      dashboards: {
        overview: 'hub-overview',
        tenants: 'hub-tenants',
        performance: 'hub-performance',
        alerts: 'hub-alerts'
      }
    },

    // Kibana - Logs & Analytics
    kibana: {
      enabled: true,
      url: 'http://localhost:5601',
      proxyPath: '/tools/kibana',
      defaultIndex: 'hub-logs-*',
      indexes: {
        hubLogs: 'hub-logs-*',
        auditLogs: 'audit-logs-*',
        securityLogs: 'security-logs-*',
        tenantLogs: 'tenant-logs-*'
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
      realm: 'e-guce-hub'
    },

    // Generator Configurator UI
    configurator: {
      enabled: true,
      proxyPath: '/tools/configurator',
      wizardSteps: [
        'instance-info',
        'modules-selection',
        'branding',
        'integrations',
        'security',
        'review'
      ]
    },

    // Camunda Hub (for Hub workflows if any)
    camunda: {
      enabled: true,
      url: 'http://localhost:8083',
      proxyPath: '/tools/camunda',
      cockpitPath: '/camunda/app/cockpit',
      tasklistPath: '/camunda/app/tasklist',
      adminPath: '/camunda/app/admin'
    },

    // Drools Hub (for Hub business rules)
    drools: {
      enabled: true,
      url: 'http://localhost:8084',
      proxyPath: '/tools/drools',
      workbenchPath: '/business-central'
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
      url: 'http://localhost:8080/swagger-ui.html',
      proxyPath: '/tools/api-docs'
    }
  },

  // Tool Access Roles
  toolsAccess: {
    grafana: ['hub-admin', 'hub-operator', 'monitoring-viewer'],
    kibana: ['hub-admin', 'log-viewer'],
    keycloakAdmin: ['hub-admin'],
    configurator: ['hub-admin', 'generator-operator'],
    camunda: ['hub-admin', 'workflow-admin'],
    drools: ['hub-admin', 'rules-admin'],
    prometheus: ['hub-admin', 'monitoring-viewer'],
    jaeger: ['hub-admin', 'developer'],
    swagger: ['hub-admin', 'developer']
  }
};
