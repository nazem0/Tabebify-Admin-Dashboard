import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  ElementRef,
} from '@angular/core';

export interface RowActionItem {
  key: string;
  label: string;
  icon: string;
  /** Tailwind text-color class, e.g. 'text-error' or 'text-green-700'. */
  colorClass?: string;
  disabled?: boolean;
}

interface MenuCoords {
  top: number;
  right: number;
}

/**
 * Generic per-row context menu (3-dots + floating panel).
 *
 * The floating panel uses `position: fixed` with viewport coordinates calculated
 * at open time. This lets it escape any `overflow: auto/hidden` ancestor —
 * including table scroll wrappers — without causing layout shifts or scrollbars.
 *
 * Usage:
 *   <app-row-actions-menu [items]="getMenuItems(row)" (itemClick)="onMenuAction($event, row)" />
 */
@Component({
  selector: 'app-row-actions-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onOutsideClick($event)',
    '(window:scroll)': 'close()',
    '(window:resize)': 'close()',
  },
  styles: [`
    @keyframes rowActionsMenuIn {
      from { opacity: 0; transform: scale(0.95) translateY(-6px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    .menu-panel {
      animation: rowActionsMenuIn 120ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform-origin: top right;
    }
  `],
  template: `
    <!-- 3-dots trigger button -->
    <button
      type="button"
      class="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
      (click)="toggle($event)"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="menu"
      aria-label="More actions"
    >
      <span class="material-symbols-outlined text-[18px] pointer-events-none" aria-hidden="true">more_vert</span>
    </button>

    <!-- Floating panel — fixed-positioned so it escapes overflow containers -->
    @if (isOpen()) {
      <div
        class="menu-panel fixed z-9999 bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-2 min-w-42"
        [style.top.px]="coords().top"
        [style.right.px]="coords().right"
        role="menu"
        aria-orientation="vertical"
      >
        @for (item of items(); track item.key) {
          <button
            type="button"
            class="w-full text-left flex items-center gap-2 rounded-xl py-2.5 px-3 text-sm font-semibold transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
            [class]="item.colorClass ?? 'text-on-surface'"
            [disabled]="item.disabled ?? false"
            (click)="select($event, item.key)"
            role="menuitem"
          >
            <span class="material-symbols-outlined text-[16px] pointer-events-none shrink-0" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        }
      </div>
    }
  `,
})
export class RowActionsMenuComponent {
  readonly items = input.required<RowActionItem[]>();
  readonly itemClick = output<string>();

  private readonly elementRef = inject(ElementRef);

  protected readonly isOpen = signal(false);
  protected readonly coords = signal<MenuCoords>({ top: 0, right: 0 });

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close();
      return;
    }
    // Anchor the panel to the button's bottom-right corner in viewport space.
    // position: fixed escapes all overflow containers — no clipping, no scrollbars.
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.coords.set({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    this.isOpen.set(true);
  }

  protected select(event: MouseEvent, key: string): void {
    event.stopPropagation();
    this.itemClick.emit(key);
    this.close();
  }

  protected close(): void {
    if (this.isOpen()) this.isOpen.set(false);
  }

  protected onOutsideClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
