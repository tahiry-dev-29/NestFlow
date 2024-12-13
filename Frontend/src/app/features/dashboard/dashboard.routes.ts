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
        title: 'Dashboard Overview',
        loadComponent: () =>import('../dashboard/components/content-dashboard/content-dashboard.component').then((m) => m.ContentDashboardComponent),
      },
      {
        path: 'users',
        title: 'Dashboard / Users',
        loadComponent: () =>
          import('../users/components/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'subscriptions/list',
        title: 'Subscriptions / List',
        loadComponent: () =>
          import('../subscription/components/subscription/subscription.component').then(
            (m) => m.SubscriptionComponent
          ),
      },
      {
        path: 'settings',
        title: 'Dashboard / Settings',
        loadComponent: () =>
          import('../shared/components/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];
