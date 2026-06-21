import { Component, ChangeDetectionStrategy } from '@angular/core';

// Proxies to use when implementing:
// ReviewService — list/delete reviews
// ProviderStatsService — nurse rating averages and counts

@Component({
  selector: 'app-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-primary mb-1">Ratings & Reviews</h2>
      <p class="text-sm text-on-surface-variant">View and manage patient reviews and nurse ratings.</p>
      <div class="mt-8 rounded-2xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
        Coming soon — under development.
      </div>
    </div>
  `,
})
export class ReviewsComponent {}
