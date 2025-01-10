import { Routes } from '@angular/router';
import { EditSubscriptionComponent } from './components/edit-subscription/edit-subscription.component';
import { AddSubscriptionComponent } from './components/add-subscription/add-subscription.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';

export const SubscriptionRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',    
    },
    {
        path: 'list',
        title: 'List / Subscriptions',
        // loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
        component: SubscriptionComponent
    },
    {
        path: 'add',
        title: 'Add / Subscription',
        // loadComponent: () => import('./components/add-subscription/add-subscription.component').then(m => m.AddSubscriptionComponent)
        component: AddSubscriptionComponent
    },
    {
        path: 'edit/:id',
        title: 'Edit / Subscription',
        // loadComponent: () => import('./components/edit-subscription/edit-subscription.component').then(m => m.EditSubscriptionComponent)
        component: EditSubscriptionComponent
    },
]