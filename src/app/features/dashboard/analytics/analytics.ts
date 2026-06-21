import { Component, ChangeDetectionStrategy } from '@angular/core';

// Proxies to use when implementing:
// AdminDashboardService.getAnalytics() — full analytics data
// Export will require custom backend endpoints for CSV/PDF/Excel

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-primary mb-1">Analytics & Reports</h2>
      <p class="text-sm text-on-surface-variant">Detailed user, booking and revenue analytics with export.</p>
      <div class="mt-8 rounded-2xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
        Coming soon — under development.
      </div>
    </div>
  `,
})
export class AnalyticsComponent {}
