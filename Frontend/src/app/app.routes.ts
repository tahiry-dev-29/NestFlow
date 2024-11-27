import { Routes } from '@angular/router';

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
];
