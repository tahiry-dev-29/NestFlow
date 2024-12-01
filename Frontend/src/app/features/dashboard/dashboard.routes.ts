import { Routes } from '@angular/router';
import { NotFoundComponent } from '../shared/pages/not-found/not-found.component';

export const DashboardRouter: Routes = [
  {
    path: '',
    title: 'Dashboard',
    loadComponent: () => import('../dashboard/components/dashboard-overview/dashboard-overview.component').then((m) => m.DashboardOverviewComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        title: 'Dashboard',
        loadComponent: () =>import('../dashboard/components/content-dashboard/content-dashboard.component').then((m) => m.ContentDashboardComponent),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () =>
          import('../users/components/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];
