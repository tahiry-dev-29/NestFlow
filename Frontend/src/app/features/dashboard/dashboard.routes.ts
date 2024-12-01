import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { NotFoundComponent } from '../shared/pages/not-found/not-found.component';

export const DashboardRouter: Routes = [
  {
    path: '',
    title: 'Dashboard',
    component: DashboardOverviewComponent,
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          import('../dashboard/components/content-dashboard/content-dashboard.component').then(
            (m) => m.ContentDashboardComponent
          ),
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
