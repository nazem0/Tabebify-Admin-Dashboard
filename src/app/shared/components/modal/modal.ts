import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="labelledBy()"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          (click)="onClose()"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          [class]="panelClass()"
        >
          <header class="sticky top-0 z-10 shrink-0 flex justify-between items-center bg-primary px-6 py-6 overflow-hidden">
            <ng-content select="[header]" />
            <button
              type="button"
              class="w-10 h-10 ms-auto inline-flex items-center justify-center rounded-xl hover:bg-surface-500  00 transition-colors text-white/70 hover:text-white"
              (click)="onClose()"
              aria-label="Close"
            >
              <span
                class="material-symbols-outlined text-[20px] pointer-events-none"
                aria-hidden="true"
                >close</span
              >
            </button>
          </header>

          <div class="overflow-y-auto flex-1">
            <ng-content select="[body]" />
          </div>

          <footer class="shrink-0 bg-surface-container-lowest">
            <ng-content select="[footer]" />
          </footer>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly labelledBy = input<string>('modal-title');
  readonly close = output<void>();

  protected readonly panelClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
    };
    return sizeMap[this.size()];
  });

  protected onClose(): void {
    this.close.emit();
  }
}
