import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

/**
 * Presentational component: service breadcrumb, h2 title, description,
 * status toggle (ARIA switch) and "Edit Core Info" button.
 * All state flows in via inputs; all actions flow out via outputs.
 */
@Component({
  selector: 'app-service-info-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './service-info-header.html',
})
export class ServiceInfoHeaderComponent {
  readonly serviceId = input.required<string>();
  readonly serviceName = input.required<string>();
  readonly serviceDescription = input<string | undefined>(undefined);
  readonly categoryName = input<string | undefined>(undefined);
  readonly isVerified = input<boolean | undefined>(false);

  readonly statusToggle = output<boolean>();
  readonly editCoreInfo = output<string>();
}
