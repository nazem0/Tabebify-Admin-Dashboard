import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-user-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">

      <!-- Search ──────────────────────────────────────────────────────── -->
      <div class="relative flex-1 w-full sm:max-w-md">
        <span
          class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                 text-slate-400 text-[18px] pointer-events-none"
          aria-hidden="true"
        >search</span>
        <input
          type="search"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl
                 text-sm text-slate-700 placeholder:text-slate-400
                 focus:ring-2 focus:ring-accent-teal/30 focus:border-accent-teal/60
                 transition-all outline-none"
          placeholder="Search by name, email or ID…"
          [value]="search()"
          (input)="searchChange.emit($any($event.target).value)"
          aria-label="Search users"
        />
      </div>

      <!-- Right actions ───────────────────────────────────────────────── -->
      <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">

        <!-- Filter -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200
                 bg-white text-sm font-medium text-slate-600
                 hover:bg-slate-50 transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">filter_list</span>
          <span>Filter</span>
        </button>

        <!-- Add New User -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                 bg-accent-teal text-sm font-semibold text-white
                 hover:bg-accent-teal/90 transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-accent-teal/50
                 ml-auto sm:ml-0 whitespace-nowrap"
          (click)="addUser.emit()"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
          <span>Add New User</span>
        </button>

      </div>
    </div>
  `,
})
export class UserFiltersComponent {
  readonly search = input.required<string>();

  readonly searchChange = output<string>();
  readonly addUser = output<void>();
}
