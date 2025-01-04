import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimise les cycles de détection de changement
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Fournit le routeur avec les routes configurées
    provideRouter(routes),

    // Fournit les animations Angular avec une gestion asynchrone
    provideAnimationsAsync(),

    // Fournit le Store NgRx (assurez-vous de l'avoir configuré ailleurs si nécessaire)
    provideStore(),

    // Fournit le client HTTP pour gérer les requêtes
    provideHttpClient(),

    // Configure ngx-toastr pour afficher des notifications élégantes
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
      enableHtml: true,
      extendedTimeOut: 1000,
      closeButton: true,
    }),
  ],
};
