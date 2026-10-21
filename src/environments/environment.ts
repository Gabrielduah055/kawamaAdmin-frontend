import { apiEndpoints, externalEndpoints, storefrontRoutes } from './environment.config';

export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  storefrontBaseUrl: 'http://localhost:4200',
  apiEndpoints,
  externalEndpoints,
  storefrontRoutes,
} as const;
