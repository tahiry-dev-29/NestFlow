import { Routes } from '@angular/router';
import { NotFoundComponent } from '../shared/pages/not-found/not-found.component';
import { adminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth-guard.guard';

export const DashboardRouter: Routes = [
  {
    path: '',
    title: 'Dashboard',
    loadComponent: () => import('../dashboard/components/dashboard-overview/dashboard-overview.component').then((m) => m.DashboardOverviewComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        title: 'Dashboard Overview',
        loadComponent: () => import('../dashboard/components/content-dashboard/content-dashboard.component').then((m) => m.ContentDashboardComponent),
      },
      {
        path: "subscriptions",
        loadChildren: () => import('../subscription/subscritpion.routes').then(m => m.SubscriptionRoutes)
      },
      {
        path: "users",
        loadChildren: () => import('../users/users.routes').then(m => m.UsersRoutes),
        canActivate: [adminGuard]
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
