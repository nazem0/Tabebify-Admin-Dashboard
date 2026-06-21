import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { abpOAuthGuard } from '@abp/ng.oauth';

export const routes: Routes = [
  { 
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    canActivate:[guestGuard]
  },
  {
    path: 'dashboard',
    canActivate: [abpOAuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
