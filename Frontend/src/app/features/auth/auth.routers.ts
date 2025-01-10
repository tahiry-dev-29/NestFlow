import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const AuthRoutes: Routes = [
  {
    path: 'login',
    title: 'Login',
    // loadComponent: () => import("./components/login/login.component").then(m => m.LoginComponent)
    component: LoginComponent
  },
  /* {
    path: 'register',
    title: 'Sign Up',
    loadComponent: () => import("./components/register/register.component").then(m => m.RegisterComponent)
  }, */
  // {
  //   path: 'pin',
  //   title: 'Verification Pin',
  //   loadComponent: () => import("./components/pin/pin.component").then(m => m.PINComponent)
  // },
];
