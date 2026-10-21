import { apiEndpoints, externalEndpoints, storefrontRoutes } from './environment.config';

export const environment = {
  production: true,
  apiBaseUrl: 'https://kawama-admin-backend.onrender.com/api/v1',
  storefrontBaseUrl: '',
  apiEndpoints,
  externalEndpoints,
  storefrontRoutes,
} as const;
