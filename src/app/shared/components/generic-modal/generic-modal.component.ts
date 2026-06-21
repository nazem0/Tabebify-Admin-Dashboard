import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';

// Monotonic counter — deterministic, SSR-safe (no Math.random()).
// Ensures each mounted modal gets a unique aria-labelledby target.
let _modalIdSeed = 0;

const SIZE_CLASS: Record<string, string> = {
  sm: 'max-w-sm',    // 384 px  — info / alert dialogs
  md: 'max-w-md',   // 448 px  — simple forms (add user, quick edit)
  lg: 'max-w-2xl',  // 672 px  — complex forms (nurse profile, multi-step)
  xl: 'max-w-4xl',  // 896 px  — wide panels / split-view modals
};

@Component({
  selector: 'app-generic-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Escape key closes the modal without needing @HostListener.
    '(document:keydown.escape)': 'handleEscape()',
  },
  templateUrl: './generic-modal.component.html',
})
export class GenericModalComponent {
  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Dialog');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  /** Set false on destructive / multi-step forms to prevent accidental dismissal. */
  readonly closeOnOverlayClick = input<boolean>(true);
  /**
   * Set false to suppress the built-in title/close header entirely.
   * Use this when the consumer (e.g. MasterDetailModalComponent) supplies its
   * own full-bleed header projected into [modal-body].
   */
  readonly showHeader = input<boolean>(true);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly onClose = output<void>();

  // ── Internals ─────────────────────────────────────────────────────────────
  readonly titleId = `generic-modal-title-${++_modalIdSeed}`;

  protected readonly panelClass = computed(() => SIZE_CLASS[this.size()] ?? SIZE_CLASS['md']);

  protected handleOverlayClick(): void {
    if (this.closeOnOverlayClick()) {
      this.onClose.emit();
    }
  }

  protected handleEscape(): void {
    if (this.isOpen()) {
      this.onClose.emit();
    }
  }
}
