import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AppCurrencyPipe } from '../../../../../shared/pipes/currency.pipe';

/**
 * Presentational component: 3 stat cards — Base Price, Standard Duration, Service Icon.
 * Uses AppCurrencyPipe for locale-aware USD formatting.
 */
@Component({
  selector: 'app-service-stats-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppCurrencyPipe],
  host: { class: 'block shrink-0' },
  templateUrl: './service-stats-bar.html',
})
export class ServiceStatsBarComponent {
  readonly price = input<number | undefined>(undefined);
  readonly durationMinutes = input<number | undefined>(undefined);
  readonly iconUrl = input<string>('');
}
