import { Environment } from '@abp/ng.core';

const baseUrl = 'https://tabebify-admin-dashboard.vercel.app';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'Tabebify',
    logoUrl: '',
  },
  oAuthConfig: {
  issuer: 'https://tabebify.tryasp.net/', // تأكد من الـ Port والـ HTTPS
  redirectUri: baseUrl  , 
  clientId: 'Tabebify_App',
  responseType: 'password', 
  scope: 'openid offline_access profile roles Tabebify', 
  requireHttps: true,
},
  apis: {
    default: {
      url: 'https://tabebify.tryasp.net',
      rootNamespace: 'Tabebify',
    },
  },
} as Environment;
