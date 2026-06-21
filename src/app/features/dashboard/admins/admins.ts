import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { toast } from 'ngx-sonner';
import { IdentityUserService } from '../../../proxy/volo/abp/identity/identity-user.service';
import type { IdentityUserDto } from '../../../proxy/volo/abp/identity/models';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { AdminCreateFormComponent } from './components/admin-create-form/admin-create-form';
import { MinPipe } from '../../../shared/pipes/min.pipe';
import { buildPageArray } from '../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-admins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatCardComponent,
    ConfirmationModalComponent,
    ModalComponent,
    AdminCreateFormComponent,
    MinPipe,
  ],
  templateUrl: './admins.html',
})
export class AdminsComponent {
  private readonly userService = inject(IdentityUserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 10;

  protected readonly users = signal<IdentityUserDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly page = signal(0);
  protected readonly search = signal('');

  protected readonly activeCount = computed(() => this.users().filter(u => u.isActive).length);
  protected readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));
  protected readonly pages = computed(() => buildPageArray(this.totalPages(), this.page()));

  protected readonly showCreateModal = signal(false);
  protected readonly editingUser = signal<IdentityUserDto | null>(null);
  protected readonly deleteTarget = signal<IdentityUserDto | null>(null);
  protected readonly isDeleting = signal(false);

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.isLoading.set(true);
          return this.userService.getList({
            filter: this.search() || undefined,
            skipCount: this.page() * this.pageSize,
            maxResultCount: this.pageSize,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.users.set(result.items ?? []);
          this.totalCount.set(result.totalCount ?? 0);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });

    this.loadTrigger$.next();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
    this.loadTrigger$.next();
  }

  protected onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadTrigger$.next();
  }

  protected openCreateModal(): void { this.showCreateModal.set(true); }
  protected closeCreateModal(): void { this.showCreateModal.set(false); }

  protected openEditModal(user: IdentityUserDto): void { this.editingUser.set(user); }
  protected closeEditModal(): void { this.editingUser.set(null); }

  protected onAdminSaved(): void {
    this.showCreateModal.set(false);
    this.editingUser.set(null);
    this.page.set(0);
    this.loadTrigger$.next();
  }

  protected openDeleteConfirm(user: IdentityUserDto): void { this.deleteTarget.set(user); }
  protected cancelDelete(): void { this.deleteTarget.set(null); }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target?.id) return;
    this.isDeleting.set(true);
    this.userService
      .delete(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.deleteTarget.set(null);
          this.loadTrigger$.next();
          toast.success('"' + (target.userName ?? 'Admin') + '" deleted.');
        },
        error: () => {
          this.isDeleting.set(false);
          this.deleteTarget.set(null);
          toast.error('Failed to delete admin.');
        },
      });
  }

  protected displayName(user: IdentityUserDto): string {
    const parts = [user.name, user.surname].filter(Boolean);
    return parts.length ? parts.join(' ') : (user.userName ?? '—');
  }
}
