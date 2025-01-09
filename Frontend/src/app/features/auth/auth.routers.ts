import { Routes } from '@angular/router';

export const AuthRoutes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import("./components/login/login.component").then(m => m.LoginComponent)
  },
  /* {
    path: 'register',
    title: 'Sign Up',
    loadComponent: () => import("./components/register/register.component").then(m => m.RegisterComponent)
  }, */
  {
    path: 'pin',
    title: 'Verification Pin',
    loadComponent: () => import("./components/pin/pin.component").then(m => m.PINComponent)
  },
];
