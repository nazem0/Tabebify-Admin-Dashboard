import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription } from 'rxjs';
import { AdminDashboardService } from '../../../proxy/admin/admin-dashboard.service';
import { AnalyticsPeriod } from '../../../proxy/admin/analytics-period.enum';
import { AppointmentService } from '../../../proxy/appointments';
import { AnalyticsCardComponent } from './components/analytics-card/analytics-card';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart';
import { BookingStatusComponent } from './components/booking-status/booking-status';
import { RecentBookingsTableComponent } from './components/recent-bookings-table/recent-bookings-table';
import type { AdminAnalyticsDto } from '../../../proxy/admin/models';
import type { AppointmentSummaryDto } from '../../../proxy/appointments/models';

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnalyticsCardComponent,
    RevenueChartComponent,
    BookingStatusComponent,
    RecentBookingsTableComponent,
  ],
  templateUrl: './overview.html',
})
export class OverviewComponent implements OnInit {
  private readonly adminDashboard     = inject(AdminDashboardService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef         = inject(DestroyRef);

  protected readonly analytics      = signal<AdminAnalyticsDto | null>(null);
  protected readonly recentBookings = signal<AppointmentSummaryDto[]>([]);
  protected readonly isLoading      = signal(true);
  protected readonly error          = signal<string | null>(null);
  protected readonly currentPeriod  = signal<AnalyticsPeriod>(AnalyticsPeriod.Month);

  // Cancels the in-flight analytics request when the period changes before it resolves.
  private analyticsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadRecentBookings();
  }

  protected onPeriodChange(period: AnalyticsPeriod): void {
    this.currentPeriod.set(period);
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.analyticsSubscription?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);

    this.analyticsSubscription = this.adminDashboard
      .getAnalytics(this.currentPeriod())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.analytics.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load analytics data. Please refresh the page.');
          this.isLoading.set(false);
        },
      });
  }

  private loadRecentBookings(): void {
    this.appointmentService
      .getList({ maxResultCount: 6 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result =>{
          console.log(result.items);
          this.recentBookings.set(result.items ?? [])
        },
        error: () => {}, // non-critical — table shows its own empty state
      });
  }
}
