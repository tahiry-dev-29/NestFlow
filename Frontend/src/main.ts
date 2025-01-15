import { provideHttpClient } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {
    // Ignore les erreurs de connexion spécifiques
    if (error.message?.includes('Could not establish connection')) {
      return;
    }
    console.error('An error occurred:', error);
  }
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    provideHttpClient()
  ]
}).catch(err => console.error(err));

