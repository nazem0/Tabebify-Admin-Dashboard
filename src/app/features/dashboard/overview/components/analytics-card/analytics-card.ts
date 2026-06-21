import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-analytics-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-2xl p-5 flex flex-col gap-4 border shadow-sm transition-all"
      [class]="isDark()
        ? 'bg-[#08204d] border-transparent'
        : 'bg-white border-outline-variant/20'"
    >
      <!-- Icon + Badge row -->
      <div class="flex items-start justify-between gap-2">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          [class]="isDark() ? 'bg-white/15' : 'bg-surface-container-low'"
          aria-hidden="true"
        >
          <span
            class="material-symbols-outlined text-[22px]"
            [class]="isDark() ? 'text-[#00D8CF]' : 'text-primary'"
          >{{ icon() }}</span>
        </div>

        @if (isDark()) {
          <span
            class="inline-flex items-center gap-1.5 bg-[#00D8CF] text-[#08204d] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0"
            aria-label="Live data"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#08204d] animate-pulse" aria-hidden="true"></span>
            LIVE
          </span>
        } @else if (growth() !== 0) {
          <span
            class="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
            [class]="growth() > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            [attr.aria-label]="(growth() > 0 ? 'Up ' : 'Down ') + absGrowth() + ' percent'"
          >{{ growth() > 0 ? '+' : '' }}{{ growth() }}%</span>
        }
      </div>

      <!-- Label + Value -->
      <div>
        <p
          class="text-[10px] font-bold uppercase tracking-widest mb-1.5"
          [class]="isDark() ? 'text-white/50' : 'text-on-surface-variant'"
        >{{ title() }}</p>
        <p
          class="text-[30px] font-bold tabular-nums leading-none"
          [class]="isDark() ? 'text-white' : 'text-primary'"
        >{{ formattedValue() }}</p>
      </div>
    </div>
  `,
})
export class AnalyticsCardComponent {
  readonly title  = input.required<string>();
  readonly value  = input<number | undefined | null>(null);
  readonly growth = input<number>(0);
  readonly isDark = input<boolean>(false);
  readonly icon   = input<string>('analytics');

  protected readonly absGrowth = computed(() => Math.abs(this.growth()));

  protected readonly formattedValue = computed(() => {
    const v = this.value();
    if (v == null) return '—';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (v >= 1_000)     return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return v.toLocaleString();
  });
}
