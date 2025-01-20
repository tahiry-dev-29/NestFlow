import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './features/auth/intercepteurs/authentifiction.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    provideAnimations(),
    provideToastr({
      timeOut: 2000,
      extendedTimeOut: 2000,
      closeButton: false,
      positionClass: 'toast-bottom-right',
      tapToDismiss: true,
      enableHtml: true,
      preventDuplicates: false,
    }),
  ]
};

