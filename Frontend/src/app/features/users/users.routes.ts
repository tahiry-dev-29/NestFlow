import { Routes } from '@angular/router';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UserTableComponent } from './components/table/user-table.component';

export const UsersRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
    },
    {
        path: 'list',
        title: 'List / Users',
        // loadComponent: () => import('./components/table/user-table.component').then(m => m.UserTableComponent),
        component: UserTableComponent
    },
    {
        path: 'add',
        title: 'Add / User',
        // loadComponent: () => import('./components/add-user/add-user.component').then(m => m.AddUserComponent),
        component: AddUserComponent
    }
    
];