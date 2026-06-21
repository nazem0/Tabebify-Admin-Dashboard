import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type BadgeScheme = 'appointment' | 'user' | 'provider' | 'document' | 'payment';

interface BadgeStyle {
  classes: string;
  label: string;
  dot: string;
  pulse: boolean;
}

const FALLBACK: BadgeStyle = {
  classes: 'bg-surface-container-low text-on-surface-variant',
  label: 'Unknown',
  dot: 'bg-outline-variant',
  pulse: false,
};

const APPOINTMENT_STYLES: Record<number, BadgeStyle> = {
  0: { classes: 'bg-amber-100 text-amber-800',   label: 'Pending Payment',  dot: 'bg-amber-500',   pulse: false },
  1: { classes: 'bg-purple-100 text-purple-800', label: 'Searching Nurse',  dot: 'bg-purple-500',  pulse: true },
  2: { classes: 'bg-blue-100 text-blue-800',     label: 'Accepted',         dot: 'bg-blue-500',    pulse: true },
  3: { classes: 'bg-indigo-100 text-indigo-800', label: 'En Route',         dot: 'bg-indigo-500',  pulse: true },
  4: { classes: 'bg-green-100 text-green-800',   label: 'Completed',        dot: 'bg-green-500',   pulse: false },
  5: { classes: 'bg-teal-100 text-teal-800',     label: 'Reviewed',         dot: 'bg-teal-500',    pulse: false },
  6: { classes: 'bg-red-100 text-red-800',       label: 'Cancelled',        dot: 'bg-red-500',     pulse: false },
  7: { classes: 'bg-red-100 text-red-800',       label: 'Cancelled',        dot: 'bg-red-500',     pulse: false },
  8: { classes: 'bg-red-100 text-red-800',       label: 'Cancelled',        dot: 'bg-red-500',     pulse: false },
};

function resolveUserOrProvider(raw: string): BadgeStyle {
  switch (raw) {
    case 'active':
    case 'true':
    case '1':
      return { classes: 'bg-green-100 text-green-800',   label: 'Active',   dot: 'bg-green-500',   pulse: false };
    case 'inactive':
    case 'false':
    case '0':
      return { classes: 'bg-surface-container-low text-on-surface-variant', label: 'Inactive', dot: 'bg-outline-variant', pulse: false };
    case 'blocked':
      return { classes: 'bg-red-100 text-red-800',     label: 'Blocked',  dot: 'bg-red-500',     pulse: false };
    case 'pending':
      return { classes: 'bg-amber-100 text-amber-800', label: 'Pending',  dot: 'bg-amber-500',   pulse: false };
    case 'rejected':
      return { classes: 'bg-red-100 text-red-800',     label: 'Rejected', dot: 'bg-red-500',     pulse: false };
    default:
      return { ...FALLBACK, label: raw };
  }
}

function resolveDocument(raw: string): BadgeStyle {
  switch (raw) {
    case 'approved':
      return { classes: 'bg-green-100 text-green-800', label: 'Approved', dot: 'bg-green-500', pulse: false };
    case 'rejected':
      return { classes: 'bg-red-100 text-red-800',     label: 'Rejected', dot: 'bg-red-500',   pulse: false };
    default:
      return { classes: 'bg-amber-100 text-amber-800', label: 'Pending',  dot: 'bg-amber-500', pulse: false };
  }
}

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="px-3 py-1 rounded-full text-label-sm font-bold inline-flex items-center gap-1.5 w-fit"
      [class]="style().classes"
    >
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0"
        [class]="style().dot + (style().pulse ? ' animate-pulse' : '')"
        aria-hidden="true"
      ></span>
      {{ label() || style().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string | number>();
  readonly scheme = input<BadgeScheme>('appointment');
  /** Override the computed label if you already have a resolved string. */
  readonly label = input<string>('');

  protected readonly style = computed((): BadgeStyle => {
    const s = this.status();
    const scheme = this.scheme();

    if (scheme === 'appointment') {
      const num = typeof s === 'number' ? s : Number(s);
      return APPOINTMENT_STYLES[num] ?? FALLBACK;
    }

    const raw = String(s).toLowerCase();

    if (scheme === 'user' || scheme === 'provider') {
      return resolveUserOrProvider(raw);
    }

    if (scheme === 'document') {
      return resolveDocument(raw);
    }

    return { ...FALLBACK, label: String(s) };
  });
}
