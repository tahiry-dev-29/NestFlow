import { Routes } from '@angular/router';

export const SubscriptionRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',    
    },
    {
        path: 'list',
        title: 'List / Subscriptions',
        loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
    },
    {
        path: 'add',
        title: 'Add / Subscription',
        loadComponent: () => import('./components/add-subscription/add-subscription.component').then(m => m.AddSubscriptionComponent)
    },
    {
        path: 'edit/:id',
        title: 'Edit / Subscription',
        loadComponent: () => import('./components/edit-subscription/edit-subscription.component').then(m => m.EditSubscriptionComponent)
    },
]