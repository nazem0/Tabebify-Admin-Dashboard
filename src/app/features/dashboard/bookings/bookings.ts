import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subject, switchMap } from 'rxjs';
import { AppointmentService } from '../../../proxy/appointments/appointment.service';
import { AppointmentStatus } from '../../../proxy/appointments/appointment-status.enum';
import type { AppointmentSummaryDto } from '../../../proxy/appointments/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { AppInitialsPipe } from '../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../shared/pipes/app-date.pipe';
import { AppCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { buildPageArray } from '../../../shared/utils/pagination.utils';

// Note: Text search, status, date-range, and assigned filters are applied client-side
// because the appointments endpoint only supports isActive + pagination.
// When a dedicated admin appointments endpoint lands, move these to query params
// and remove the computed filteredBookings layer.

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-bookings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, AppInitialsPipe, AppDatePipe, AppCurrencyPipe, DatePipe],
  templateUrl: './bookings.html',
})
export class BookingsComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 12;

  protected readonly bookings = signal<AppointmentSummaryDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<number | null>(null);
  protected readonly dateRangeFilter = signal<string>('all');
  protected readonly assignedFilter = signal<string>('all');

  protected readonly dateRangeOptions: SelectOption<string>[] = [
    { label: 'All Time',    value: 'all'   },
    { label: 'Today',       value: 'today' },
    { label: 'This Week',   value: 'week'  },
    { label: 'This Month',  value: 'month' },
  ];

  protected readonly statusOptions: SelectOption<number | null>[] = [
    { label: 'All Statuses',     value: null },
    { label: 'Pending Payment',  value: AppointmentStatus.PendingPayment },
    { label: 'Searching Nurse',  value: AppointmentStatus.SearchingProvider },
    { label: 'Accepted',         value: AppointmentStatus.Accepted },
    { label: 'En Route',         value: AppointmentStatus.EnRoute },
    { label: 'Completed',        value: AppointmentStatus.Completed },
    { label: 'Reviewed',         value: AppointmentStatus.Reviewed },
    { label: 'Cancelled (All)',  value: AppointmentStatus.CancelledByPatient },
  ];

  protected readonly assignedOptions: SelectOption<string>[] = [
    { label: 'All Bookings', value: 'all'        },
    { label: 'Assigned',     value: 'assigned'   },
    { label: 'Unassigned',   value: 'unassigned' },
  ];

  protected readonly filteredBookings = computed(() => {
    let items = this.bookings();

    const q = this.search().toLowerCase().trim();
    if (q) {
      items = items.filter(
        b =>
          b.visitNumber?.toLowerCase().includes(q) ||
          b.serviceName?.toLowerCase().includes(q) ||
          b.assignedProviderName?.toLowerCase().includes(q) ||
          b.addressLabel?.toLowerCase().includes(q),
      );
    }

    const status = this.statusFilter();
    if (status !== null) {
      items =
        status === AppointmentStatus.CancelledByPatient
          ? items.filter(
              b =>
                b.status === AppointmentStatus.CancelledByPatient ||
                b.status === AppointmentStatus.CancelledByProvider ||
                b.status === AppointmentStatus.CancelledNoProvider,
            )
          : items.filter(b => b.status === status);
    }

    const assigned = this.assignedFilter();
    if (assigned === 'assigned')   items = items.filter(b => !!b.assignedProviderName);
    if (assigned === 'unassigned') items = items.filter(b => !b.assignedProviderName);

    const range = this.dateRangeFilter();
    if (range !== 'all') {
      // Capture reference time once per computed evaluation to avoid midnight-boundary
      // drift if the signal re-evaluates across a day change.
      const now = new Date();
      items = items.filter(b => {
        if (!b.createdAt) return false;
        const d = new Date(b.createdAt);
        if (range === 'today') return d.toDateString() === now.toDateString();
        if (range === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }
        if (range === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    return items;
  });

  protected readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  // Shared pagination utility — eliminates the algorithm duplicated in services & payments.
  protected readonly pages = computed(() => buildPageArray(this.totalPages(), this.page()));

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.isLoading.set(true);
          this.error.set(null);
          return this.appointmentService.getList({
            skipCount: this.page() * this.pageSize,
            maxResultCount: this.pageSize,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.bookings.set(result.items ?? []);
          this.totalCount.set(result.totalCount ?? 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load bookings. Please refresh the page.');
          this.isLoading.set(false);
        },
      });

    this.loadTrigger$.next();
  }

  protected onSearch(value: string): void { this.search.set(value); }

  // HTML selects always yield strings from the DOM event; parse here so the template
  // stays simple and the signal stays typed as number | null.
  protected onStatusChange(rawValue: string): void {
    this.statusFilter.set(rawValue === 'null' || rawValue === '' ? null : Number(rawValue));
  }
  protected onDateRangeChange(value: string): void { this.dateRangeFilter.set(value); }
  protected onAssignedChange(value: string): void { this.assignedFilter.set(value); }

  protected onPageChange(p: number | null): void {
    if (p === null) return;
    this.page.set(p);
    this.loadTrigger$.next();
  }

  protected isUnassigned(booking: AppointmentSummaryDto): boolean {
    return !booking.assignedProviderName;
  }

}
