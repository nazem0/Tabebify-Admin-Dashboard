import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppCurrencyPipe } from '../../../../../shared/pipes/currency.pipe';
import type { AppointmentSummaryDto } from '../../../../../proxy/appointments/models';

@Component({
  selector: 'app-recent-bookings-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusBadgeComponent, AppDatePipe, AppInitialsPipe, AppCurrencyPipe],
  templateUrl: './recent-bookings-table.html',
})
export class RecentBookingsTableComponent {
  // AppointmentSummaryDto is used directly — no patient name is exposed by the proxy.
  // The "Nurse" column shows assignedProviderName; visitNumber maps to Booking ID.
  readonly bookings   = input.required<AppointmentSummaryDto[]>();
  readonly isLoading  = input<boolean>(false);
  readonly viewAllLink = input<string>('../bookings');
}
