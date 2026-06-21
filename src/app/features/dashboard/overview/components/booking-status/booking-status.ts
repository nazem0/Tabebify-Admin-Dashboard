import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  viewChild,
  ElementRef,
  effect,
  OnDestroy,
} from '@angular/core';
import type { Chart as ChartType } from 'chart.js';
import type { BookingStatusDto } from '../../../../../proxy/admin/models';

interface LegendItem {
  label:       string;
  color:       string;
  textColor:   string;
  bgColor:     string;
  value:       number;
  description: string;
}

// Semantic status palette — color encodes outcome, not brand identity.
const C = {
  completed: { hex: '#22c55e', hover: '#16a34a', text: 'text-green-700', bg: 'bg-green-50'  },
  pending:   { hex: '#3b82f6', hover: '#2563eb', text: 'text-blue-700',  bg: 'bg-blue-50'   },
  cancelled: { hex: '#f87171', hover: '#ef4444', text: 'text-red-600',   bg: 'bg-red-50'    },
  empty:     { hex: '#e2e8f0' },
} as const;

@Component({
  selector: 'app-booking-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-status.html',
})
export class BookingStatusComponent implements OnDestroy {
  readonly status = input<BookingStatusDto | null | undefined>(null);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('statusCanvas');
  private chart: ChartType | null = null;

  protected readonly successRate = computed(() =>
    Math.round(this.status()?.successRate ?? 0),
  );

  protected readonly totalBookings = computed(() => {
    const s = this.status();
    return (s?.completed ?? 0) + (s?.pending ?? 0) + (s?.cancelled ?? 0);
  });

  /** True only when every counter is genuinely zero — distinct from "no status object". */
  protected readonly allZero = computed(() => this.totalBookings() === 0);

  protected readonly legend = computed((): LegendItem[] => {
    const s = this.status();
    return [
      {
        label:       'Completed',
        color:       C.completed.hex,
        textColor:   C.completed.text,
        bgColor:     C.completed.bg,
        value:       s?.completed ?? 0,
        description: 'Successfully finished',
      },
      {
        label:       'Pending',
        color:       C.pending.hex,
        textColor:   C.pending.text,
        bgColor:     C.pending.bg,
        value:       s?.pending ?? 0,
        description: 'Awaiting completion',
      },
      {
        label:       'Cancelled',
        color:       C.cancelled.hex,
        textColor:   C.cancelled.text,
        bgColor:     C.cancelled.bg,
        value:       s?.cancelled ?? 0,
        description: 'Terminated early',
      },
    ];
  });

  constructor() {
    effect(() => {
      const s      = this.status();
      const canvas = this.canvasRef()?.nativeElement;
      if (!s || !canvas) return;
      this.renderChart(canvas, s);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private async renderChart(canvas: HTMLCanvasElement, s: BookingStatusDto): Promise<void> {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    this.chart?.destroy();

    const completed = s.completed ?? 0;
    const pending   = s.pending   ?? 0;
    const cancelled = s.cancelled ?? 0;
    const total     = completed + pending + cancelled;

    const isEmpty = total === 0;

    /**
     * Segment pipeline — guarantees color always encodes the correct semantic status.
     *
     * Define all three segments with their fixed color assignments FIRST,
     * then filter to non-zero values. This means:
     *   • completed=0 → green is absent (no phantom arc from borderRadius)
     *   • pending=2   → blue arc fills the full ring correctly
     *   • cancelled=0 → red is absent
     *
     * Never re-order this array; the color at each index is semantically bound
     * to that outcome (Completed→Green, Pending→Blue, Cancelled→Red).
     */
    const allSegments = [
      { label: 'Completed', value: completed, color: C.completed.hex, hover: C.completed.hover },
      { label: 'Pending',   value: pending,   color: C.pending.hex,   hover: C.pending.hover   },
      { label: 'Cancelled', value: cancelled, color: C.cancelled.hex, hover: C.cancelled.hover },
    ];
    const segments = isEmpty ? [] : allSegments.filter(s => s.value > 0);

    const chartData = isEmpty ? [1]                    : segments.map(s => s.value);
    const colors    = isEmpty ? [C.empty.hex]          : segments.map(s => s.color);
    const hovers    = isEmpty ? [C.empty.hex]          : segments.map(s => s.hover);
    const labels    = isEmpty ? ['No activity yet']    : segments.map(s => s.label);

    this.chart = new (Chart as any)(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data:                chartData,
          backgroundColor:     colors,
          hoverBackgroundColor: hovers,
          borderWidth:         0,
          hoverOffset:         isEmpty ? 0 : 6,
          borderRadius:        isEmpty ? 0 : 4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout:              '76%',
        animation:           { animateRotate: !isEmpty },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: !isEmpty,
            backgroundColor: '#1e293b',
            titleColor:      'rgba(255,255,255,0.55)',
            bodyColor:       '#ffffff',
            footerColor:     'rgba(255,255,255,0.45)',
            borderColor:     'rgba(255,255,255,0.08)',
            borderWidth:     1,
            padding:         { x: 14, y: 12 },
            cornerRadius:    12,
            displayColors:   false,
            titleFont:       { size: 11 },
            bodyFont:        { size: 15, weight: 'bold' },
            footerFont:      { size: 10 },
            callbacks: {
              title:  (items: any[]) => items[0]?.label ?? '',
              label:  (ctx: any)     => `${(ctx.parsed as number).toLocaleString()} bookings`,
              footer: (items: any[]) => {
                const val = (items[0]?.parsed as number) ?? 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                return `${pct}% of all bookings`;
              },
            },
          },
        },
      },
    });
  }
}
