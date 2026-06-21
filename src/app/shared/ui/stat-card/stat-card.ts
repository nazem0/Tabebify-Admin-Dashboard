import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type StatCardVariant = 'default' | 'teal' | 'error' | 'primary';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-2xl p-6 shadow-sm flex flex-col gap-3 relative overflow-hidden"
      [class]="containerClass()"
    >
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center" [class]="iconBgClass()">
          <span
            class="material-symbols-outlined text-[22px]"
            [class]="iconClass()"
            aria-hidden="true"
            >{{ icon() }}</span
          >
        </div>
        <p class="text-label-sm font-semibold uppercase tracking-wider" [class]="labelClass()">
          {{ label() }}
        </p>

        @if (badge()) {
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
            [class]="badgeClass()"
          >
            <span class="material-symbols-outlined text-[13px]" aria-hidden="true">{{
              badgeTrend()
            }}</span>
            {{ badge() }}
          </span>
        }
      </div>
      <div class="relative z-10">
        <p class="text-3xl font-bold tabular-nums" [class]="valueClass()">{{ value() ?? '—' }}</p>
        @if (subtitle()) {
          <p class="text-xs mt-0.5" [class]="subtitleClass()">{{ subtitle() }}</p>
        }
      </div>
      <!-- Decorative background icon -->
      @if (variant() === 'primary') {
        <span
          class="material-symbols-outlined absolute -right-3 -bottom-3 text-[80px] opacity-10 select-none pointer-events-none text-white"
          aria-hidden="true"
          >{{ icon() }}</span
        >
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>(null);
  readonly subtitle = input<string>('');
  readonly badge = input<string>('');
  readonly badgePositive = input<boolean>(true);
  readonly variant = input<StatCardVariant>('default');

  protected readonly badgeTrend = computed(() =>
    this.badgePositive() ? 'arrow_upward' : 'arrow_downward',
  );

  protected readonly containerClass = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-primary border border-primary';
      case 'teal':
        return 'bg-white border border-outline-variant/20';
      case 'error':
        return 'bg-white border border-outline-variant/20';
      default:
        return 'bg-white border border-outline-variant/20';
    }
  });

  protected readonly iconBgClass = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-white/10';
      case 'teal':
        return 'bg-accent-teal/10';
      case 'error':
        return 'bg-error/10';
      default:
        return 'bg-primary/5';
    }
  });

  protected readonly iconClass = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'text-white';
      case 'teal':
        return 'text-accent-teal';
      case 'error':
        return 'text-error';
      default:
        return 'text-primary';
    }
  });

  protected readonly valueClass = computed(() =>
    this.variant() === 'primary' ? 'text-white' : 'text-primary',
  );

  protected readonly subtitleClass = computed(() =>
    this.variant() === 'primary' ? 'text-white/60' : 'text-on-surface-variant',
  );

  protected readonly labelClass = computed(() =>
    this.variant() === 'primary' ? 'text-white/70' : 'text-on-surface-variant/60',
  );

  protected readonly badgeClass = computed(() => {
    if (this.variant() === 'primary') {
      return this.badgePositive() ? 'bg-white/20 text-white' : 'bg-white/20 text-white';
    }
    return this.badgePositive() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  });
}
