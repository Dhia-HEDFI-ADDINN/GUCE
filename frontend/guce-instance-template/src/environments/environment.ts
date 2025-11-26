// Environment template - Variables will be replaced during generation
export const environment = {
  production: false,

  // Instance Configuration (replaced by Generator)
  instance: {
    code: '{{INSTANCE_CODE}}',           // e.g., 'CM', 'TD', 'CF'
    name: '{{INSTANCE_NAME}}',           // e.g., 'GUCE Cameroun'
    domain: '{{INSTANCE_DOMAIN}}',       // e.g., 'guce-cameroun.com'
    country: '{{INSTANCE_COUNTRY}}',     // e.g., 'Cameroun'
    currency: '{{INSTANCE_CURRENCY}}',   // e.g., 'XAF'
    locale: '{{INSTANCE_LOCALE}}',       // e.g., 'fr-CM'
    timezone: '{{INSTANCE_TIMEZONE}}'    // e.g., 'Africa/Douala'
  },

  // Branding (replaced by Generator)
  branding: {
    primaryColor: '{{PRIMARY_COLOR}}',     // e.g., '#1E5631'
    secondaryColor: '{{SECONDARY_COLOR}}', // e.g., '#CE1126'
    logo: 'assets/logo.png'
  },

  // API Configuration
  apiUrl: 'http://localhost:8080/api/v1',

  // Keycloak Configuration
  keycloak: {
    url: 'http://localhost:8180',
    realm: '{{KEYCLOAK_REALM}}',           // e.g., 'guce-cameroun'
    clientId: '{{KEYCLOAK_CLIENT_ID}}'     // e.g., 'guce-cameroun'
  },

  // Hub Communication (for monitoring agent)
  hub: {
    url: 'https://e-guce-hub.com',
    enabled: true,
    apiKey: '{{HUB_API_KEY}}'
  },

  // Feature Flags (can be overridden per instance)
  features: {
    eForce: true,
    eGov: true,
    eBusiness: true,
    ePayment: true,
    procedureBuilder: true,
    admin: true
  }
};
