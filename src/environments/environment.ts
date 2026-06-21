import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'Tabebify',
    logoUrl: '',
  },
  oAuthConfig: {
  issuer: 'https://localhost:44318/', // تأكد من الـ Port والـ HTTPS
  redirectUri: baseUrl  , 
  clientId: 'Tabebify_App',
  responseType: 'password', 
  scope: 'openid offline_access profile roles Tabebify', 
  requireHttps: true,
},
  apis: {
    default: {
      url: 'https://localhost:44318',
      rootNamespace: 'Tabebify',
    },
  },
} as Environment;
