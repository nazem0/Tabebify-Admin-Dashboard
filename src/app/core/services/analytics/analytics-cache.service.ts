import { Injectable, inject } from '@angular/core';
import { shareReplay } from 'rxjs';
import { AdminDashboardService } from '../../../proxy/admin/admin-dashboard.service';
import { AnalyticsPeriod } from '../../../proxy/admin/analytics-period.enum';
import type { AdminAnalyticsDto } from '../../../proxy/admin/models';
import type { Observable } from 'rxjs';

/**
 * Fetches analytics once per app session (Month period) and replays the cached result.
 * Used by pages that need summary stats but do not expose a period picker.
 * Pages with a period picker (e.g. Overview) call AdminDashboardService directly.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsCacheService {
  private readonly admin = inject(AdminDashboardService);

  // refCount: false keeps the cache alive even after all consumers unsubscribe,
  // so navigating away and back does not trigger a second HTTP call.
  readonly analytics$: Observable<AdminAnalyticsDto> = this.admin
    .getAnalytics(AnalyticsPeriod.Month)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));
}
