import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { StatCardComponent, StatCardVariant } from '../../ui/stat-card/stat-card';

/**
 * Metric card with a built-in loading skeleton.
 *
 * Wraps StatCardComponent so callers don't need a separate @if(isLoading) block
 * for each card in a dashboard grid.
 *
 * Example:
 *   <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
 *     <app-metric-card
 *       [isLoading]="isLoading()"
 *       icon="group"
 *       label="Total Users"
 *       [value]="analytics()?.totalPatients ?? 0"
 *       subtitle="Registered patients"
 *     />
 *   </div>
 */
@Component({
  selector: 'app-metric-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCardComponent],
  template: `
    @if (isLoading()) {
      <div
        class="animate-pulse bg-white rounded-2xl h-32 border border-outline-variant/20"
        aria-busy="true"
        aria-label="Loading metric"
      ></div>
    } @else {
      <app-stat-card
        [icon]="icon()"
        [label]="label()"
        [value]="value()"
        [subtitle]="subtitle()"
        [badge]="badge()"
        [badgePositive]="badgePositive()"
        [variant]="variant()"
      />
    }
  `,
})
export class MetricCardComponent {
  readonly isLoading = input<boolean>(false);
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>(null);
  readonly subtitle = input<string>('');
  readonly badge = input<string>('');
  readonly badgePositive = input<boolean>(true);
  readonly variant = input<StatCardVariant>('default');
}
