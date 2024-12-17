import { Routes } from '@angular/router';

export const UsersRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
    },
    {
        path: 'list',
        title: 'List / Users',
        loadComponent: () => import('./components/table/table.component').then(m => m.TableComponent),
    },
    {
        path: 'add',
        title: 'Add / User',
        loadComponent: () => import('./components/add-user/add-user.component').then(m => m.AddUserComponent),
    },
    {
        path: 'edit/:id',
        title: 'Edit / User',
        loadComponent: () => import('./components/edit-user/edit-user.component').then(m => m.EditUserComponent),
    },
];