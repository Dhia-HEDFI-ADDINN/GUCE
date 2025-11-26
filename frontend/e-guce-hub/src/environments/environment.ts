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
  }
};
