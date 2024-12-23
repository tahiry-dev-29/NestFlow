import { Routes } from '@angular/router';
import { NotFoundComponent } from './features/shared/pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routers').then((m) => m.AuthRoutes),
  },
  {
    path:'dashboard',
    loadChildren:()=> import('./features/dashboard/dashboard.routes').then((m)=>m.DashboardRouter)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
