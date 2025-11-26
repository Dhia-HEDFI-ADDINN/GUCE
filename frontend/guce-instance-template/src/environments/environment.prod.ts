export const environment = {
  production: true,

  instance: {
    code: '{{INSTANCE_CODE}}',
    name: '{{INSTANCE_NAME}}',
    domain: '{{INSTANCE_DOMAIN}}',
    country: '{{INSTANCE_COUNTRY}}',
    currency: '{{INSTANCE_CURRENCY}}',
    locale: '{{INSTANCE_LOCALE}}',
    timezone: '{{INSTANCE_TIMEZONE}}'
  },

  branding: {
    primaryColor: '{{PRIMARY_COLOR}}',
    secondaryColor: '{{SECONDARY_COLOR}}',
    logo: 'assets/logo.png'
  },

  apiUrl: 'https://{{INSTANCE_DOMAIN}}/api/v1',

  keycloak: {
    url: 'https://auth.{{INSTANCE_DOMAIN}}',
    realm: '{{KEYCLOAK_REALM}}',
    clientId: '{{KEYCLOAK_CLIENT_ID}}'
  },

  hub: {
    url: 'https://e-guce-hub.com',
    enabled: true,
    apiKey: '{{HUB_API_KEY}}'
  },

  features: {
    eForce: true,
    eGov: true,
    eBusiness: true,
    ePayment: true,
    procedureBuilder: true,
    admin: true
  }
};
