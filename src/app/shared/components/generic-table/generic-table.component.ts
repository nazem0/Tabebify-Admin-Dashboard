import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import type { TableLazyLoadEvent } from 'primeng/table';

import { TableModule } from 'primeng/table';
import { StatusBadgeComponent } from '../status-badge/status-badge';
import { AppInitialsPipe } from '../../pipes/initials.pipe';
import { AppDatePipe } from '../../pipes/app-date.pipe';

import type { TableColumn } from './table-column.model';

@Component({
  selector: 'app-generic-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, StatusBadgeComponent, AppInitialsPipe, AppDatePipe],
  templateUrl: './generic-table.component.html',
})
export class GenericTableComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly data = input<any[]>([]);
  readonly totalRecords = input<number>(0);
  readonly columns = input<TableColumn[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly pageSize = input<number>(10);
  /** Reactive block/unblock state map: id → isActive. Merged with row.isActive as fallback. */
  readonly activeStates = input<Map<string, boolean>>(new Map());
  /** ID of the row currently undergoing a block/unblock toggle — shows spinner. */
  readonly togglingId = input<string | null>(null);
  /** Row property used as the unique identifier (default: 'id'). */
  readonly idField = input<string>('id');
  readonly emptyIcon = input<string>('table_rows');
  readonly emptyMessage = input<string>('No records found');
  readonly exportFileName = input<string>('export');
  readonly tableStyle = input<Record<string, string>>({ 'min-width': '60rem' });

  // ── Two-way models ────────────────────────────────────────────────────────
  /** Current page index (0-based). Parent can reset to 0 on search; table keeps paginator in sync. */
  readonly page = model<number>(0);
  /** Current search query — updated after debounce, propagated to parent via model binding. */
  readonly search = model<string>('');

  // ── Outputs ───────────────────────────────────────────────────────────────
  /** Emits the debounced, distinct search string (300 ms). Page is reset to 0 before emission. */
  readonly onSearch = output<string>();
  /** Emits the raw PrimeNG TableLazyLoadEvent on paginator interaction. */
  readonly onLazyLoadEvent = output<TableLazyLoadEvent>();
  readonly onEdit = output<any>();
  readonly onDelete = output<any>();
  readonly onToggleBlock = output<any>();
  readonly onView = output<any>();
  readonly onRowClick = output<any>();
  readonly onResetPassword = output<any>();
  // ── Computed ──────────────────────────────────────────────────────────────
  /**
   * Binds [first] on p-table so the paginator stays in sync when the parent
   * resets page to 0 (e.g. after a search). Critical for OnPush correctness.
   */
  protected readonly first = computed(() => this.page() * this.pageSize());

  protected readonly exportableColumns = computed(() =>
    this.columns().filter(c => c.type !== 'actions' && !c.skipExport),
  );

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.search.set(value);
        this.page.set(0);
        this.onSearch.emit(value);
      });
  }

  // ── Table event handlers ──────────────────────────────────────────────────

  protected handleLazyLoad(event: TableLazyLoadEvent): void {
    const newPage = Math.floor((event.first ?? 0) / (event.rows ?? this.pageSize()));
    this.page.set(newPage);
    this.onLazyLoadEvent.emit(event);
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  // ── Row helpers ───────────────────────────────────────────────────────────

  protected getValue(row: any, col: TableColumn): any {
    return col.valueResolver ? col.valueResolver(row) : (row[col.field] ?? null);
  }

  /** Checks the reactive activeStates map first, then falls back to DTO fields. */
  protected isRowActive(row: any): boolean {
    const id = row[this.idField()];
    return this.activeStates().get(id) ?? row['isActive'] ?? row['isAccountActive'] ?? true;
  }

  protected isRowToggling(row: any): boolean {
    return this.togglingId() === row[this.idField()];
  }

  protected tdClass(col: TableColumn, base = 'px-6 py-4'): string {
    return col.responsiveClass ? `${base} ${col.responsiveClass}` : base;
  }

  // ── CSV Export ────────────────────────────────────────────────────────────

  downloadCSV(): void {
    const cols = this.exportableColumns();
    const headers = cols.map(c => this.csvEscape(c.exportHeader ?? c.header));
    const rows = this.data().map(row =>
      cols.map(col => {
        const raw = this.getValue(row, col);
        return this.csvEscape(raw == null ? '—' : String(raw));
      }),
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    // BOM prefix ensures Excel opens UTF-8 CSV without mojibake.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.exportFileName()}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private csvEscape(value: string): string {
    return /[,"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }
}
