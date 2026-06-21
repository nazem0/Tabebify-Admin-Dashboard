import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { ModalComponent } from '../modal/modal';

export type ConfirmVariant = 'danger' | 'warning' | 'primary' | 'teal';

// Monotonic counter — deterministic and SSR-safe (unlike Math.random()).
// Multiple confirmation modals on the same page get unique aria-labelledby targets.
let _confirmId = 0;

@Component({
  selector: 'app-confirmation-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      size="sm"
      [labelledBy]="titleId"
      (close)="cancel.emit()"
    >
      <div class="p-6 pt-10 text-center" body>

        <div
          class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          [class]="iconBgClass()"
          aria-hidden="true"
        >
          <span
            class="material-symbols-outlined text-[28px] pointer-events-none"
            [class]="iconTextClass()"
            aria-hidden="true"
          >{{ icon() }}</span>
        </div>

        <h3 [id]="titleId" class="font-bold text-primary text-lg mb-2">{{ title() }}</h3>

        <p class="text-on-surface-variant text-sm mb-6 leading-relaxed">{{ message() }}</p>

        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl border border-outline-variant font-semibold text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            (click)="cancel.emit()"
            [disabled]="isConfirming()"
          >{{ cancelLabel() }}</button>

          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl font-semibold text-body-md text-white hover:opacity-90 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
            [class]="confirmBtnClass()"
            [disabled]="isConfirming()"
            (click)="confirm.emit()"
          >
            @if (isConfirming()) {
              <span
                class="material-symbols-outlined text-[16px] animate-spin pointer-events-none"
                aria-hidden="true"
              >progress_activity</span>
              {{ confirmingLabel() }}
            } @else {
              {{ confirmLabel() }}
            }
          </button>
        </div>

      </div>
    </app-modal>
  `,
})
export class ConfirmationModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirm');
  readonly confirmingLabel = input<string>('Processing…');
  readonly cancelLabel = input<string>('Cancel');
  readonly variant = input<ConfirmVariant>('danger');
  readonly icon = input<string>('help');
  readonly isConfirming = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly titleId = `confirm-${++_confirmId}`;

  protected readonly iconBgClass = computed(() => {
    switch (this.variant()) {
      case 'danger':  return 'bg-error/10';
      case 'warning': return 'bg-amber-100';
      case 'teal':    return 'bg-accent-teal/10';
      default:        return 'bg-primary/10';
    }
  });

  protected readonly iconTextClass = computed(() => {
    switch (this.variant()) {
      case 'danger':  return 'text-error';
      case 'warning': return 'text-amber-600';
      case 'teal':    return 'text-accent-teal';
      default:        return 'text-primary';
    }
  });

  protected readonly confirmBtnClass = computed(() => {
    switch (this.variant()) {
      case 'danger':  return 'bg-error hover:bg-error/90';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600';
      case 'teal':    return 'bg-accent-teal hover:bg-accent-teal/90';
      default:        return 'bg-primary hover:bg-primary/90';
    }
  });
}
