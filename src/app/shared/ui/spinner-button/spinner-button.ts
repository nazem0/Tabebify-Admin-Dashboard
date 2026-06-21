import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-spinner-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <button
      [type]="type()"
      [disabled]="isLoading() || disabled()"
      [attr.aria-busy]="isLoading() ? 'true' : null"
      class="w-full py-4 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20
             hover:bg-primary/90 active:scale-[0.98] transition-all text-base
             disabled:opacity-60 disabled:cursor-not-allowed"
    >
      @if (isLoading()) {
        <span class="inline-flex items-center justify-center gap-2">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loadingLabel() }}
        </span>
      } @else {
        {{ label() }}
      }
    </button>
  `,
})
export class SpinnerButtonComponent {
  readonly label = input.required<string>();
  readonly loadingLabel = input<string>('Loading…');
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'submit' | 'button' | 'reset'>('submit');
}
