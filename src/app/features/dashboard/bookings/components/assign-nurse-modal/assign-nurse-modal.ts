import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { GenericModalComponent } from '../../../../../shared/components/generic-modal/generic-modal.component';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AdminDashboardService } from '../../../../../proxy/admin';
import type { AdminProviderListDto } from '../../../../../proxy/admin/models';
import { AppointmentService } from '../../../../../proxy/appointments/appointment.service';
import type { AppointmentSummaryDto } from '../../../../../proxy/appointments/models';
import { ProviderAccountStatus } from '../../../../../proxy/profiles';

@Component({
  selector: 'app-assign-nurse-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericModalComponent, AppInitialsPipe],
  templateUrl: './assign-nurse-modal.html',
})
export class AssignNurseModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly appointment = input<AppointmentSummaryDto | null>(null);

  readonly assigned = output<void>();
  readonly closed = output<void>();

  private readonly adminService = inject(AdminDashboardService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly providers = signal<AdminProviderListDto[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isAssigning = signal(false);
  protected readonly search = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly availableOnly = signal(true);
  protected readonly withoutActiveAssignment = signal(true);
  protected readonly loadError = signal<string | null>(null);

  private readonly reload$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  constructor() {
    effect(() => {
      if (this.isOpen() && this.appointment()) {
        this.selectedId.set(null);
        this.search.set('');
        this.loadError.set(null);
        this.reload$.next();
      }
    });

    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.search.set(value);
        this.reload$.next();
      });

    this.reload$
      .pipe(
        switchMap(() => {
          if (!this.isOpen()) return of(null);
          this.isLoading.set(true);
          this.loadError.set(null);
          return this.adminService
            .getProviders({
              accountStatus: ProviderAccountStatus.Approved,
              isAvailable: this.availableOnly() ? true : undefined,
              onlyWithoutActiveAssignment: this.withoutActiveAssignment() ? true : undefined,
              filter: this.search().trim() || undefined,
              skipCount: 0,
              maxResultCount: 50,
            })
            .pipe(
              catchError(() => {
                this.loadError.set('Failed to load nurses. Please try again.');
                return of(null);
              }),
              finalize(() => this.isLoading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result) {
          this.providers.set([]);
          return;
        }
        this.providers.set(result.items ?? []);
        const selected = this.selectedId();
        if (selected && !(result.items ?? []).some(p => p.id === selected)) {
          this.selectedId.set(null);
        }
      });
  }

  protected onSearch(value: string): void {
    this.search$.next(value);
  }

  protected toggleAvailableOnly(): void {
    this.availableOnly.update(v => !v);
    this.reload$.next();
  }

  protected toggleWithoutActiveAssignment(): void {
    this.withoutActiveAssignment.update(v => !v);
    this.reload$.next();
  }

  protected selectProvider(provider: AdminProviderListDto): void {
    if (!provider.id || this.isAssigning()) return;
    this.selectedId.set(provider.id);
  }

  protected confirmAssign(): void {
    const appointmentId = this.appointment()?.id;
    const providerId = this.selectedId();
    if (!appointmentId || !providerId || this.isAssigning()) return;

    const nurse = this.providers().find(p => p.id === providerId);
    this.isAssigning.set(true);

    this.appointmentService
      .assignProvider(appointmentId, providerId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAssigning.set(false)),
      )
      .subscribe({
        next: () => {
          toast.success(`${nurse?.fullName ?? 'Nurse'} assigned successfully.`);
          this.assigned.emit();
          this.closed.emit();
        },
        error: () => toast.error('Failed to assign nurse. Please try again.'),
      });
  }

  protected handleClose(): void {
    if (this.isAssigning()) return;
    this.closed.emit();
  }
}
