import { registerLocaleData } from '@angular/common';
import localeEnGh from '@angular/common/locales/en-GH';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './core/auth.interceptor';
import { routes } from './app.routes';

registerLocaleData(localeEnGh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'en-GH' },
  ]
};
