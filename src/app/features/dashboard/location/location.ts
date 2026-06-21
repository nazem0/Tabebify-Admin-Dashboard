import { Component, ChangeDetectionStrategy } from '@angular/core';

// Note: No ABP proxy exists yet for location/coverage management.
// Will require custom backend endpoints for service areas and area-based pricing.
// UpdateProviderLocationDto exists in appointments proxy for nurse live location.

@Component({
  selector: 'app-location',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-primary mb-1">Location & Coverage</h2>
      <p class="text-sm text-on-surface-variant">Manage service areas, pricing zones and live nurse tracking.</p>
      <div class="mt-8 rounded-2xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
        Coming soon — under development.
      </div>
    </div>
  `,
})
export class LocationComponent {}
