import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAbpCore, withOptions } from '@abp/ng.core';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { HTTP_ERROR_CONFIG } from '@abp/ng.theme.shared';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { registerLocaleForEsBuild } from '@abp/ng.core/locale';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { abpErrorInterceptor } from './core/interceptors/abp-error.interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
// Keeps OAuth tokens in localStorage — unpublished factory, not part of the public API.
function oAuthStorageFactory(): OAuthStorage {
  return localStorage;
}

/*
 * HTTP pipeline order (outermost → innermost):
 *   1. abpErrorInterceptor  (withInterceptors — toasts on 4xx/5xx)
 *   2. ABP interceptors     (withInterceptorsFromDi — auth header, tenant, locale)
 *
 * HTTP_ERROR_CONFIG suppresses ABP's full-page error overlays so our toast
 * interceptor remains the single error presentation surface.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAbpCore(withOptions({ environment, registerLocaleFn: registerLocaleForEsBuild() })),
    provideAbpOAuth(),
    { provide: OAuthStorage, useFactory: oAuthStorageFactory },
    {
      provide: HTTP_ERROR_CONFIG,
      useValue: { skipHandledErrorCodes: [0, 401, 403, 404, 500] },
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([abpErrorInterceptor]),
      withInterceptorsFromDi(),
    ),
    provideRouter(routes, withViewTransitions()),
providePrimeNG({
  
      ripple: true,
      theme: {
        preset: Aura, 
        options: {
          darkModeSelector: false,
          
        }
      }
    }) 
  ],
};
