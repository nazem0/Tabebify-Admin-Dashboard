import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import type { AdminProviderListDto } from '../../../../../proxy/admin';

@Component({
  selector: 'app-nurse-profile-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, AppInitialsPipe, AppDatePipe],
  template: `
    @if (provider(); as p) {
      <app-modal [isOpen]="true" size="md" labelledBy="nurse-profile-title" (close)="close.emit()">

        <!-- Header band -->
        <div class="relative" header>
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0" aria-hidden="true">
              {{ p.fullName | initials }}
            </div>
            <div class="min-w-0">
              <h2 id="nurse-profile-title" class="font-bold text-white text-lg truncate">{{ p.fullName ?? '—' }}</h2>
              <p class="text-white/70 text-sm truncate">{{ p.email ?? '—' }}</p>
            </div>
          </div>
          <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] opacity-10 select-none pointer-events-none text-white" aria-hidden="true">medical_services</span>
        
        </div>

        <!-- Details -->
        <dl class="px-6 py-5 space-y-4" body>

          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant w-5 shrink-0" aria-hidden="true">star</span>
            <div>
              <dt class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Rating</dt>
              <dd class="text-primary font-semibold text-body-md">
                @if (p.ratingAverage) {
                  {{ p.ratingAverage.toFixed(1) }} / 5 ({{ p.ratingCount ?? 0 }} reviews)
                } @else {
                  No ratings yet
                }
              </dd>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant w-5 shrink-0" aria-hidden="true">calendar_today</span>
            <div>
              <dt class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Joined</dt>
              <dd class="text-primary font-semibold text-body-md">{{ p.createdAt | appDate }}</dd>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant w-5 shrink-0" aria-hidden="true">badge</span>
            <div>
              <dt class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</dt>
              <dd class="font-semibold text-body-md capitalize" [class]="statusClass(p)">
                {{ statusLabel(p) }}
              </dd>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant w-5 shrink-0" aria-hidden="true">fingerprint</span>
            <div>
              <dt class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nurse ID</dt>
              <dd class="text-on-surface-variant font-mono text-[12px]">{{ p.id }}</dd>
            </div>
          </div>

        </dl>

        <!-- Footer -->
        <div class="px-6 pb-5 flex gap-3" footer>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl border border-outline-variant font-semibold text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            (click)="close.emit()"
          >Close</button>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl bg-primary/8 text-primary font-bold text-body-md hover:bg-primary/12 transition-colors flex items-center justify-center gap-2"
            (click)="viewDocuments.emit(p)"
          >
            <span class="material-symbols-outlined text-[17px] pointer-events-none" aria-hidden="true">workspace_premium</span>
            View Documents
          </button>
        </div>

      </app-modal>
    }
  `,
})
export class NurseProfileModalComponent {
  readonly provider = input<AdminProviderListDto | null>(null);

  readonly close = output<void>();
  readonly viewDocuments = output<AdminProviderListDto>();

  protected statusLabel(p: AdminProviderListDto): string {
    if (p.isAvailable) return 'Available';
    return p.accountStatus ?? 'Unknown';
  }

  protected statusClass(p: AdminProviderListDto): string {
    if (p.isAvailable) return 'text-secondary';
    switch (p.accountStatus?.toLowerCase()) {
      case 'active':   return 'text-secondary';
      case 'pending':  return 'text-amber-600';
      case 'rejected': return 'text-error';
      default:         return 'text-on-surface-variant';
    }
  }
}
