import { Routes } from '@angular/router';
import { NotFoundComponent } from './features/shared/pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.router').then((m) => m.AuthRoutes),
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
