import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type BadgeScheme = 'appointment' | 'user' | 'provider' | 'document' | 'payment';

interface BadgeStyle {
  classes: string;
  label: string;
  dot: string;
  pulse: boolean;
  /** Render a filled circle icon only — no pill or text. */
  iconOnly?: boolean;
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

/** Maps ProviderAccountStatus enum values (0–5). */
const PROVIDER_ACCOUNT_STYLES: Record<number, BadgeStyle> = {
  0: { classes: 'bg-amber-100 text-amber-800', label: 'Pending Documents', dot: 'bg-amber-500', pulse: false },
  1: { classes: 'bg-amber-100 text-amber-800', label: 'Pending Review',    dot: 'bg-amber-500', pulse: true },
  2: { classes: 'bg-green-100 text-green-800', label: 'Approved',          dot: 'bg-green-500', pulse: false },
  3: { classes: 'bg-red-100 text-red-800',     label: 'Rejected',          dot: 'bg-red-500',   pulse: false },
  4: { classes: 'bg-red-100 text-red-800',     label: 'Suspended',         dot: 'bg-red-500',   pulse: false },
  5: { classes: 'bg-amber-100 text-amber-800', label: 'Unverified Phone',  dot: 'bg-amber-500', pulse: false },
};

function resolveUserOrProvider(raw: string): BadgeStyle {
  switch (raw) {
    case 'online':
      return { classes: 'text-green-500', label: 'Available', dot: '', pulse: false, iconOnly: true };
    case 'offline':
      return { classes: 'text-on-surface-variant/25', label: 'Unavailable', dot: '', pulse: false, iconOnly: true };
    case 'active':
    case 'true':
      return { classes: 'bg-green-100 text-green-800',   label: 'Active',   dot: 'bg-green-500',   pulse: false };
    case 'inactive':
    case 'false':
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
    @if (style().iconOnly) {
      <span
        class="material-symbols-outlined text-[18px] inline-flex"
        style="font-variation-settings: 'FILL' 1"
        [class]="style().classes"
        [attr.aria-label]="label() || style().label"
        [attr.title]="label() || style().label"
      >circle</span>
    } @else {
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
    }
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

    if (scheme === 'provider') {
      // Prefer ProviderAccountStatus numeric values; fall back to string statuses.
      const num =
        typeof s === 'number'
          ? s
          : typeof s === 'string' && /^\d+$/.test(s)
            ? Number(s)
            : NaN;
      if (Number.isInteger(num) && PROVIDER_ACCOUNT_STYLES[num]) {
        return PROVIDER_ACCOUNT_STYLES[num];
      }
      return resolveUserOrProvider(String(s).toLowerCase());
    }

    const raw = String(s).toLowerCase();

    if (scheme === 'user') {
      return resolveUserOrProvider(raw);
    }

    if (scheme === 'document') {
      return resolveDocument(raw);
    }

    return { ...FALLBACK, label: String(s) };
  });
}
