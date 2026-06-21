import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
   loadComponent: () => import('./shell/dashboard-shell').then(m => m.DashboardShellComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview').then(m => m.OverviewComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.UsersComponent),
      },
      {
        path: 'providers',
        loadComponent: () => import('./providers/providers').then(m => m.ProvidersComponent),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings').then(m => m.BookingsComponent),
      },

      {
        path: 'payments',
        loadComponent: () => import('./payments/payments').then(m => m.PaymentsComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics').then(m => m.AnalyticsComponent),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./reviews/reviews').then(m => m.ReviewsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications').then(m => m.NotificationsComponent),
      },
      {
        path: 'support',
        loadComponent: () => import('./support/support').then(m => m.SupportComponent),
      },
      {
        path: 'location',
        loadComponent: () => import('./location/location').then(m => m.LocationComponent),
      },
      {
        path:'services',
        loadComponent: () => import('./services/services').then(m => m.ServicesComponent)
      },
      {
        path: 'admins',
        loadComponent: () => import('./admins/admins').then(m => m.AdminsComponent),
      },
      {
        path: 'marketing',
        loadComponent: () => import('./marketing/marketing').then(m => m.MarketingComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings').then(m => m.SettingsComponent),
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
