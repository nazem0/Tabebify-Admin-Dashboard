import {
  Component,
  ChangeDetectionStrategy,
  computed,
  signal,
  input,
  output,
  viewChild,
  ElementRef,
  effect,
  OnDestroy,
} from '@angular/core';
import type { Chart as ChartType } from 'chart.js';
import { AnalyticsPeriod } from '../../../../../proxy/admin/analytics-period.enum';
import type { RevenueWeeklyDto } from '../../../../../proxy/admin/models';

interface PeriodOption {
  label: string;
  value: AnalyticsPeriod;
}

// Peak bar: deep primary navy. All others: muted slate so the peak stands alone.
const PEAK_COLOR  = '#08204d';
const MUTED_COLOR = '#cbd5e1';

@Component({
  selector: 'app-revenue-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue-chart.html',
})
export class RevenueChartComponent implements OnDestroy {
  readonly data          = input.required<RevenueWeeklyDto[]>();
  readonly activePeriod  = input<AnalyticsPeriod>(AnalyticsPeriod.Month);
  readonly periodChanged = output<AnalyticsPeriod>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: ChartType | null = null;

  protected readonly periods: PeriodOption[] = [
    { label: 'Last 7 Days',  value: AnalyticsPeriod.Week  },
    { label: 'Last 30 Days', value: AnalyticsPeriod.Month },
    { label: 'Last Year',    value: AnalyticsPeriod.Year  },
  ];

  protected readonly showPeriodMenu = signal(false);

  protected readonly selectedLabel = computed(
    () => this.periods.find(p => p.value === this.activePeriod())?.label ?? 'Select period',
  );

  /**
   * Index of the single highest data point.
   * Returns -1 when the dataset is empty, all-zero, or every bar ties for the top
   * (no single bar deserves the "peak" highlight when values are uniform).
   */
  protected readonly peakIndex = computed(() => {
    const amounts = this.data().map(d => d.amount ?? 0);
    if (!amounts.length) return -1;
    const max = Math.max(...amounts);
    if (max === 0) return -1;
    // All bars identical → no single peak, do not mislead by highlighting one.
    if (amounts.every(v => v === max)) return -1;
    return amounts.indexOf(max);
  });

  /**
   * Insight subtitle — tells the story before the user reads the chart.
   * Uses the raw weekName from the DTO so the grain (day / week / month) is always accurate.
   */
  protected readonly subtitle = computed(() => {
    const data = this.data();
    const idx  = this.peakIndex();
    if (!data.length) return 'No revenue data available for this period.';
    if (idx < 0)      return 'Revenue is uniform across this period. Hover bars for exact values.';
    const peak      = data[idx];
    const amount    = peak.amount ?? 0;
    const label     = peak.weekName ?? `Point ${idx + 1}`;
    const formatted = formatCurrency(amount);
    return `${label} was the peak at ${formatted}. Hover bars for exact figures.`;
  });

  constructor() {
    effect(() => {
      // Read activePeriod() so the effect re-runs on every period switch, even when
      // the data array reference hasn't changed yet (guards a potential stale-render).
      const data      = this.data();
      void this.activePeriod();   // tracked dependency — re-render on period switch
      const peakIndex = this.peakIndex();
      const canvas    = this.canvasRef()?.nativeElement;
      if (!canvas || !data.length) return;
      this.renderChart(canvas, data, peakIndex);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected selectPeriod(period: AnalyticsPeriod): void {
    this.showPeriodMenu.set(false);
    this.periodChanged.emit(period);
  }

  /**
   * Frontend safety net: detects when the backend returns wrong-grain labels
   * (e.g. "WK 1" for the 7-day period) and overrides with period-correct strings.
   * When the backend already sends correct labels they pass through unchanged.
   */
  private sanitizeLabels(raw: string[]): string[] {
    const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const period = this.activePeriod();

    if (period === AnalyticsPeriod.Week) {
      // Correct grain: each entry is already a day abbreviation.
      if (raw.every(l => DAY_NAMES.includes(l))) return raw;
      // Backend sent week labels for a day-level period — override.
      return raw.map((_, i) => DAY_NAMES[i] ?? `D${i + 1}`);
    }

    if (period === AnalyticsPeriod.Year) {
      // Correct grain: each entry is already a month abbreviation.
      if (raw.every(l => MONTH_NAMES.includes(l))) return raw;
      // Backend sent generic labels for a month-level period — override.
      return raw.map((_, i) => MONTH_NAMES[i] ?? `M${i + 1}`);
    }

    // Month period: trust the backend's weekName values as-is.
    return raw;
  }

  private async renderChart(
    canvas: HTMLCanvasElement,
    data: RevenueWeeklyDto[],
    peakIndex: number,
  ): Promise<void> {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    this.chart?.destroy();

    const amounts  = data.map(d => d.amount ?? 0);
    // Pass raw DTO labels through sanitizeLabels() which detects backend grain mismatches
    // (e.g. backend returns "WK x" for the 7-day period) and overrides with correct names.
    const labels   = this.sanitizeLabels(data.map(d => d.weekName ?? ''));
    const barColors = amounts.map((_, i) =>
      peakIndex >= 0 && i === peakIndex ? PEAK_COLOR : MUTED_COLOR,
    );

    // Scoped to this render call so the tooltip closure always uses the matching peak.
    const tooltipHandler = buildExternalTooltip(peakIndex);

    this.chart = new (Chart as any)(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label:           'Revenue',
          data:            amounts,
          backgroundColor: barColors,
          hoverBackgroundColor: amounts.map((_, i) =>
            peakIndex >= 0 && i === peakIndex ? '#0a2a5e' : '#94a3b8',
          ),
          borderRadius:     8,
          borderSkipped:    false,
          maxBarThickness:  48,   // prevents single-bar stretching in wide containers
          barPercentage:    0.5,  // sleek proportional width regardless of bar count
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled:  false,   // disable Chart.js native tooltip
            external: tooltipHandler,
          },
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks: {
              color:       '#94a3b8',
              font:        { size: 11 },
              maxRotation: 0,
            },
          },
          // Y-axis hidden: no pseudo-ticks, no cognitive noise — tooltip shows exact values.
          y: {
            display: false,
          },
        },
      },
    });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Returns a Chart.js `external` tooltip handler.
 * Creates a styled HTML div in the chart's container and positions it above the hovered bar.
 * The peakIndex is captured in the closure so every chart instance has its own handler.
 */
function buildExternalTooltip(peakIndex: number) {
  return (context: any): void => {
    const { chart, tooltip } = context;

    // Create or reuse a single tooltip div per chart container.
    const parent = chart.canvas.parentNode as HTMLElement;
    parent.style.position = 'relative';

    let el = parent.querySelector<HTMLDivElement>('.rv-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.className  = 'rv-tooltip';
      el.style.cssText = [
        'position:absolute',
        'background:#08204d',
        'color:#fff',
        'padding:10px 14px',
        'border-radius:12px',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.15s ease,top 0.1s ease,left 0.1s ease',
        'white-space:nowrap',
        'box-shadow:0 8px 24px rgba(8,32,77,0.35)',
        'z-index:10',
        'border:1px solid rgba(255,255,255,0.08)',
      ].join(';');
      parent.appendChild(el);
    }

    if (tooltip.opacity === 0) {
      el.style.opacity = '0';
      return;
    }

    const dp    = tooltip.dataPoints?.[0];
    if (!dp) return;

    const value  = dp.parsed.y as number;
    const label  = dp.label as string;
    const isPeak = peakIndex >= 0 && dp.dataIndex === peakIndex;

    el.innerHTML = [
      `<div style="font-size:10px;opacity:0.55;margin-bottom:4px;letter-spacing:0.06em;text-transform:uppercase;">${label}</div>`,
      `<div style="font-size:17px;font-weight:800;letter-spacing:-0.01em;">${formatCurrency(value)}</div>`,
      isPeak
        ? `<div style="font-size:10px;color:#00D8CF;margin-top:6px;font-weight:600;letter-spacing:0.03em;">★ Peak this period</div>`
        : '',
    ].join('');

    // Position above the caret, horizontally centred.
    const { offsetLeft, offsetTop } = chart.canvas;
    el.style.opacity   = '1';
    el.style.left      = `${offsetLeft + tooltip.caretX}px`;
    el.style.top       = `${offsetTop  + tooltip.caretY}px`;
    el.style.transform = 'translate(-50%, calc(-100% - 12px))';
  };
}
