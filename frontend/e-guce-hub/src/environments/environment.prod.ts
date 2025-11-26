export const environment = {
  production: true,

  // Hub Identification
  hub: {
    name: 'E-GUCE 3G Generator Hub',
    version: '1.0.0',
    description: 'Plateforme centrale de génération et supervision des instances GUCE'
  },

  // API Gateway Configuration
  api: {
    baseUrl: 'https://api.e-guce-hub.com',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
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
    url: 'https://auth.e-guce-hub.com',
    realm: 'e-guce-hub',
    clientId: 'e-guce-hub',
    redirectUri: 'https://e-guce-hub.com',
    silentCheckSsoRedirectUri: 'https://e-guce-hub.com/assets/silent-check-sso.html',
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
    allowedOrigins: ['https://e-guce-hub.com', 'https://api.e-guce-hub.com']
  },

  // WebSocket Configuration
  websocket: {
    url: 'wss://api.e-guce-hub.com/ws',
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
    generator: true,
    monitoring: true,
    billing: true,
    templates: true,
    marketplace: true,
    multiRegion: true,
    advancedAnalytics: true
  }
};
