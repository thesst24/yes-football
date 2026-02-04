import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RouterModule, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    [provideHttpClient()],
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
