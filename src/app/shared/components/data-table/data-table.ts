import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

      <!-- ① Toolbar slot — always rendered (search bar, tabs, action buttons) -->
      <ng-content select="[data-toolbar]" />

      <!-- ② Loading skeleton -->
      @if (isLoading()) {
        <div
          class="p-6 space-y-4"
          aria-busy="true"
          [attr.aria-label]="'Loading ' + tableLabel()"
        >
          @for (i of skeletonArray(); track i) {
            <div class="animate-pulse flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-surface-container-low shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-surface-container-low rounded w-1/4"></div>
                <div class="h-3 bg-surface-container-low rounded w-1/3"></div>
              </div>
              <div class="h-4 bg-surface-container-low rounded w-20"></div>
              <div class="h-6 bg-surface-container-low rounded-full w-16"></div>
              <div class="h-4 bg-surface-container-low rounded w-16"></div>
            </div>
          }
        </div>

      <!-- ③ Empty state -->
      } @else if (itemCount() === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
          <span
            class="material-symbols-outlined text-[48px] opacity-30"
            aria-hidden="true"
          >{{ emptyIcon() }}</span>
          <p class="text-sm mt-3">{{ emptyMessage() }}</p>
          <!-- Optional action (e.g. "Clear search") projected from consumer -->
          <ng-content select="[data-empty-action]" />
        </div>

      <!-- ④ Data area + pagination -->
      } @else {
        <div
          class="overflow-x-auto"
          role="region"
          [attr.aria-label]="tableLabel()"
          tabindex="0"
        >
          <!-- The actual <table> (or any content) projected by the consumer -->
          <ng-content />
        </div>

        <!-- Pagination footer -->
        <div class="p-4 border-t border-outline-variant bg-surface-container-low/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p class="text-label-sm text-on-surface-variant">
            Showing
            <span class="font-bold text-primary">{{ firstItem() }}–{{ lastItem() }}</span>
            of
            <span class="font-bold text-primary">{{ totalFormatted() }}</span>
            {{ tableLabel() }}
          </p>

          @if (totalPages() > 1) {
            <nav class="flex gap-1" [attr.aria-label]="tableLabel() + ' pagination'">

              <button
                class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface hover:bg-surface-container-low disabled:opacity-40 transition-colors"
                [disabled]="currentPage() === 0"
                (click)="onPageChange(currentPage() - 1)"
                aria-label="Previous page"
                type="button"
              >
                <span class="material-symbols-outlined text-[18px] pointer-events-none" aria-hidden="true">chevron_left</span>
              </button>

              @for (p of pages(); track $index) {
                @if (p === null) {
                  <span class="w-8 h-8 flex items-center justify-center text-on-surface-variant text-label-sm select-none">…</span>
                } @else {
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded border font-bold text-label-sm transition-colors"
                    [class]="p === currentPage()
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant'"
                    (click)="onPageChange(p)"
                    [attr.aria-label]="'Page ' + (p + 1)"
                    [attr.aria-current]="p === currentPage() ? 'page' : null"
                    type="button"
                  >{{ p + 1 }}</button>
                }
              }

              <button
                class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface hover:bg-surface-container-low disabled:opacity-40 transition-colors"
                [disabled]="currentPage() >= totalPages() - 1"
                (click)="onPageChange(currentPage() + 1)"
                aria-label="Next page"
                type="button"
              >
                <span class="material-symbols-outlined text-[18px] pointer-events-none" aria-hidden="true">chevron_right</span>
              </button>

            </nav>
          }
        </div>
      }

    </div>
  `,
})
export class DataTableComponent {
  readonly totalCount = input.required<number>();
  /** Number of rows per page — used to compute totalPages. */
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(0);
  readonly isLoading = input<boolean>(false);
  /** Pass items().length so the component knows when to show the empty state. */
  readonly itemCount = input<number>(0);
  readonly emptyIcon = input<string>('table_chart');
  readonly emptyMessage = input<string>('No items found');
  /** Plural noun shown in the pagination summary and ARIA labels, e.g. "users". */
  readonly tableLabel = input<string>('items');
  readonly skeletonRows = input<number>(5);
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize()),
  );

  /** 1-based index of the first item on the current page. */
  protected readonly firstItem = computed(() =>
    this.totalCount() === 0 ? 0 : this.currentPage() * this.pageSize() + 1,
  );

  /** 1-based index of the last item on the current page. */
  protected readonly lastItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize() + this.itemCount(), this.totalCount()),
  );

  /** Total count formatted with locale-aware thousand separators. */
  protected readonly totalFormatted = computed(() =>
    this.totalCount().toLocaleString('en-US'),
  );

  protected readonly skeletonArray = computed(() =>
    Array.from({ length: this.skeletonRows() }, (_, i) => i),
  );

  protected readonly pages = computed((): (number | null)[] => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const result: (number | null)[] = [0];
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    if (start > 1) result.push(null);
    for (let i = start; i <= end; i++) result.push(i);
    if (end < total - 2) result.push(null);
    result.push(total - 1);

    return result;
  });

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
