import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';


export const DashboardRouter: Routes = [
  {
    path: '',
    title: 'Dashboard',
    component: DashboardOverviewComponent,
    children: []
  },
];
