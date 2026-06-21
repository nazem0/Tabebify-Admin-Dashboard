import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, forkJoin } from 'rxjs';
import { ProviderWalletService } from '../../../proxy/payments/provider-wallet.service';
import { WalletTransactionType } from '../../../proxy/payments/wallet-transaction-type.enum';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';
import { MinPipe } from '../../../shared/pipes/min.pipe';
import { AppCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { AppDatePipe } from '../../../shared/pipes/app-date.pipe';
import { AnalyticsCacheService } from '../../../core/services/analytics/analytics-cache.service';
import { buildPageArray } from '../../../shared/utils/pagination.utils';
import type { AdminAnalyticsDto } from '../../../proxy/admin/models';
import type { ProviderWalletDto, WalletTransactionDto } from '../../../proxy/payments/models';

// Badge style resolved from a single lookup — replaces three separate switch statements.
interface TxStyle { badge: string; dot: string; label: string; }

const TX_STYLES: Record<WalletTransactionType, TxStyle> = {
  [WalletTransactionType.Credit]:     { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500',  label: 'Earned'    },
  [WalletTransactionType.Debit]:      { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',  label: 'Deducted'  },
  [WalletTransactionType.Withdrawal]: { badge: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500',   label: 'Withdrawn' },
};

const TX_FALLBACK: TxStyle = {
  badge: 'bg-surface-container-low text-on-surface-variant',
  dot: 'bg-outline-variant',
  label: 'Unknown',
};

/*
 * Template changes required (payments.html):
 *   - Replace formatCurrency(x) → {{ x | appCurrency }}
 *   - Replace formatDate(x)     → {{ x | appDate }}
 *   - Replace getTransactionBadgeClass(t.type) / getTransactionDotClass(t.type) /
 *     getTransactionLabel(t.type) → txStyle(t.type).badge / .dot / .label
 */
@Component({
  selector: 'app-payments',
  imports: [StatCardComponent, MinPipe, AppCurrencyPipe, AppDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.html',
})
export class PaymentsComponent {
  private readonly analyticsCache = inject(AnalyticsCacheService);
  private readonly walletService = inject(ProviderWalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 10;

  protected readonly analytics = signal<AdminAnalyticsDto | null>(null);
  protected readonly wallet = signal<ProviderWalletDto | null>(null);
  protected readonly transactions = signal<WalletTransactionDto[]>([]);
  protected readonly totalTransactions = signal(0);
  protected readonly page = signal(0);
  protected readonly search = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isLoadingTx = signal(false);
  protected readonly error = signal<string | null>(null);

  // Exposed so the template can compare against the enum without string literals.
  protected readonly TxType = WalletTransactionType;

  protected readonly totalPages = computed(() =>
    Math.ceil(this.totalTransactions() / this.pageSize),
  );

  // Shared pagination utility — same algorithm previously duplicated here, in bookings, and services.
  protected readonly pages = computed(() => buildPageArray(this.totalPages(), this.page()));

  // successRate is now served directly by BookingStatusDto — no manual division needed.
  protected readonly successRate = computed(() => {
    const rate = this.analytics()?.bookingStatus?.successRate;
    return rate != null ? rate.toFixed(1) + '%' : null;
  });

  // totalRevenue was removed from AdminAnalyticsDto; derive avg from wallet totalEarned.
  protected readonly avgTransaction = computed(() => {
    const earned    = this.wallet()?.totalEarned;
    const completed = this.analytics()?.bookingStatus?.completed;
    if (!earned || !completed) return null;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(earned / completed);
  });

  protected readonly payoutProgressPct = computed(() => {
    const w = this.wallet();
    if (!w?.totalEarned || !w.thisMonthEarnings) return 0;
    return Math.min(100, Math.round((w.thisMonthEarnings / w.totalEarned) * 100));
  });

  protected readonly filteredTransactions = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(
      t =>
        t.description?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q),
    );
  });

  private readonly txTrigger$ = new Subject<void>();

  constructor() {
    forkJoin({
      analytics: this.analyticsCache.analytics$,
      wallet: this.walletService.get(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ analytics, wallet }) => {
          this.analytics.set(analytics);
          this.wallet.set(wallet);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load financial data. Please refresh the page.');
          this.isLoading.set(false);
        },
      });

    this.txTrigger$
      .pipe(
        switchMap(() => {
          this.isLoadingTx.set(true);
          return this.walletService.getTransactions({
            skipCount: this.page() * this.pageSize,
            maxResultCount: this.pageSize,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.transactions.set(result.items ?? []);
          this.totalTransactions.set(result.totalCount ?? 0);
          this.isLoadingTx.set(false);
        },
        error: () => this.isLoadingTx.set(false),
      });

    this.txTrigger$.next();
  }

  protected onSearch(value: string): void { this.search.set(value); }

  protected onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.txTrigger$.next();
  }

  // Single lookup replaces three separate switch statements for badge/dot/label.
  protected txStyle(type: WalletTransactionType | undefined): TxStyle {
    return (type != null ? TX_STYLES[type] : null) ?? TX_FALLBACK;
  }
}
