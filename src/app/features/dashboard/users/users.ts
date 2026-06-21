import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, switchMap, finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import type { TableLazyLoadEvent } from 'primeng/table';

import { AdminDashboardService, AdminPatientUpdateDto } from '../../../proxy/admin';
import { UserStatusService } from '../../../core/services/user-status/user-status.service';
import { AnalyticsCacheService } from '../../../core/services/analytics/analytics-cache.service';
import { UsersDataService } from './services/users-data.service';
import type { UserDisplayDto, UserEditForm } from './models/user-display.dto';
import type { TableColumn } from '../../../shared/components/generic-table/table-column.model';

import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { UserDetailModalComponent } from './components/user-detail-modal/user-detail-modal';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { TabebifyAccountService } from '../../../proxy/services/auth';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    StatCardComponent,
    ConfirmationModalComponent,
    UserDetailModalComponent,
    GenericTableComponent,
    ModalComponent,
  ],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private readonly dataService = inject(UsersDataService);
  private readonly adminProxyService = inject(AdminDashboardService);
  private readonly accountProxyService = inject(TabebifyAccountService);
  private readonly userStatusService = inject(UserStatusService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // switchMap cancels any in-flight request when a new reload is triggered.
  private readonly reload$ = new Subject<void>();

  protected readonly analytics = toSignal(inject(AnalyticsCacheService).analytics$, {
    initialValue: null,
  });

  protected readonly pageSize = PAGE_SIZE;

  // ── Column configuration ──────────────────────────────────────────────────
  protected readonly cols: TableColumn[] = [
    {
      field: 'fullName',
      header: 'User',
      type: 'avatar',
      subtitleField: 'email',
    },
    {
      field: 'isActive',
      header: 'Status',
      type: 'badge',
      scheme: 'user',
      // isActive (boolean) → 'active' | 'blocked' string for StatusBadge
      valueResolver: (row: UserDisplayDto) => (row.isActive ? 'active' : 'blocked'),
      skipExport: true,
    },
    {
      field: 'createdAt',
      header: 'Registration Date',
      type: 'date',
      responsiveClass: 'hidden md:table-cell',
    },
    {
      field: 'bookingCount',
      header: 'Booking History',
      type: 'booking',
      responsiveClass: 'hidden lg:table-cell',
      exportHeader: 'Bookings',
    },
    {
      field: 'totalPayments',
      header: 'Total Payments',
      type: 'currency',
      prefix: '$',
      responsiveClass: 'hidden lg:table-cell',
    },
    {
      field: '_actions',
      header: 'Actions',
      type: 'actions',
      actions: { showEdit: true, showDelete: true, showBlock: true, showResetPassword: true },
      skipExport: true,
    },
  ];

  // ── Data signals ──────────────────────────────────────────────────────────
  protected readonly users = signal<UserDisplayDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly search = signal('');
  readonly userActiveStates = signal<Map<string, boolean>>(new Map());

  // ── Modal / action state ──────────────────────────────────────────────────
  protected readonly selectedUser = signal<UserDisplayDto | null>(null);
  protected readonly isDetailLoading = signal(false);
  protected readonly isEditingMode = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly deleteConfirmUser = signal<UserDisplayDto | null>(null);
  protected readonly togglingUserId = signal<string | null>(null);
  protected readonly deletingUserId = signal<string | null>(null);
  protected readonly isRegisterModalOpen = signal(false);
  protected readonly isRegistering = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  protected readonly isModalOpen = computed(() => this.selectedUser() !== null);
  protected readonly isDeleteOpen = computed(() => this.deleteConfirmUser() !== null);
  protected readonly blockedCount = computed(() => this.users().filter((u) => !u.isActive).length);

  protected readonly totalUsersFormatted = computed(() => {
    const v = this.analytics()?.totalUsers ?? this.totalCount();
    return v.toLocaleString('en-US');
  });

  protected readonly growthBadge = computed(() => {
    const pct = this.analytics()?.usersGrowthPercentage;
    return pct == null ? '' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  });

  protected readonly growthPositive = computed(
    () => (this.analytics()?.usersGrowthPercentage ?? 0) >= 0,
  );

  protected readonly editForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.minLength(2)]],
    email: [{ value: '' }],
    phoneNumber: [''],
    gender: [''],
    dateOfBirth: [''],
  });

  protected readonly registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    // userName: ['', Validators.required],
    // email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: ['', Validators.required],
    gender: ['male'],
    dateOfBirth: [''],
  });

  constructor() {
    this.reload$
      .pipe(
        switchMap(() => {
          this.isLoading.set(true);
          this.error.set(null);
          return this.dataService.getPatients({
            filter: this.search() || undefined,
            skipCount: this.page() * PAGE_SIZE,
            maxResultCount: PAGE_SIZE,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ items, totalCount }) => {
          this.users.set(items);
          this.totalCount.set(totalCount);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          const isAuth =
            err instanceof Object && 'status' in err && (err as { status: number }).status === 401;
          this.error.set(
            isAuth ? 'Session expired. Refreshing...' : 'Failed to load live dataset.',
          );
          this.isLoading.set(false);
        },
      });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.reload$.next();
  }

  // ── Generic table event handlers ──────────────────────────────────────────

  /** Receives the debounced search value emitted by GenericTableComponent. */
  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
    this.loadUsers();
  }

  /** Receives p-table's lazy load event on paginator interaction. */
  protected onPageChange(event: TableLazyLoadEvent): void {
    this.page.set(Math.floor((event.first ?? 0) / PAGE_SIZE));
    this.loadUsers();
  }

  // ── Detail modal ──────────────────────────────────────────────────────────

  protected openDetail(user: UserDisplayDto): void {
    this.selectedUser.set(user);
    this.isEditingMode.set(false);
    this.isDetailLoading.set(false);
  }

  protected closeDetail(): void {
    this.selectedUser.set(null);
    this.isEditingMode.set(false);
  }

  protected enterEditMode(): void {
    const u = this.selectedUser();
    if (!u) return;
    this.editForm.reset({
      fullName: u.fullName ?? '',
      email: u.email ?? '',
      phoneNumber: u.phoneNumber ?? '',
      gender: u.gender ?? '',
      dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
    });
    this.isEditingMode.set(true);
  }

  protected cancelEdit(): void {
    this.isEditingMode.set(false);
  }

  protected saveEdit(): void {
    if (this.editForm.invalid || this.isSaving()) return;
    const u = this.selectedUser();
    if (!u?.id) return;

    const raw = this.editForm.getRawValue() as UserEditForm;
    this.isSaving.set(true);

    this.adminProxyService
      .updatePatient(u.id, {
        fullName: raw.fullName,
        gender: raw.gender,
        phoneNumber: raw.phoneNumber,
        dateOfBirth: raw.dateOfBirth ? `${raw.dateOfBirth}T00:00:00` : null,
      } as AdminPatientUpdateDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          const updated: UserDisplayDto = {
            ...u,
            fullName: raw.fullName || u.fullName,
            phoneNumber: raw.phoneNumber || u.phoneNumber,
            gender: raw.gender || u.gender,
            dateOfBirth: raw.dateOfBirth ? `${raw.dateOfBirth}T00:00:00` : u.dateOfBirth,
          };
          this.selectedUser.set(updated);
          this.users.update((list) =>
            list.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.isEditingMode.set(false);
          toast.success(`${updated.fullName} updated successfully.`);
        },
        error: () => toast.error('Backend rejected the updates. Check validations.'),
      });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  protected onDeleteUser(user: UserDisplayDto): void {
    this.selectedUser.set(null);
    this.deleteConfirmUser.set(user);
  }

  protected closeDeleteConfirm(): void {
    this.deleteConfirmUser.set(null);
  }

  protected confirmDelete(): void {
    const user = this.deleteConfirmUser();
    console.log(user?.id);
    if (!user?.id) return;
    this.deletingUserId.set(user.id);

    this.adminProxyService
      .deletePatient(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingUserId.set(null)),
      )
      .subscribe({
        next: () => {
          this.deleteConfirmUser.set(null);
          toast.success(`${user.fullName} has been purged.`);
          this.loadUsers();
        },
        error: () => toast.error('Failed to purge patient from records.'),
      });
  }

  // ── Block / Unblock ───────────────────────────────────────────────────────

  protected onToggleBlock(user: UserDisplayDto): void {
    if (!user.id || this.togglingUserId() === user.id) return;
    this.togglingUserId.set(user.id);

    this.userStatusService
      .toggleActive(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.togglingUserId.set(null)),
      )
      .subscribe({
        next: (newActive) => {
          this.users.update((list) =>
            list.map((item) => (item.id === user.id ? { ...item, isActive: newActive } : item)),
          );
          const current = this.selectedUser();
          if (current?.id === user.id) {
            this.selectedUser.set({ ...current, isActive: newActive });
          }
          toast.success(
            newActive ? `${user.fullName} is now Active.` : `${user.fullName} has been Blocked.`,
          );
        },
        error: () => toast.error('Status sync failed with the server.'),
      });
  }

  // ── Register ──────────────────────────────────────────────────────────────

  protected onAddUser(): void {
    this.registerForm.reset({ gender: 'male' });
    this.isRegisterModalOpen.set(true);
  }

  protected closeRegisterModal(): void {
    this.isRegisterModalOpen.set(false);
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid || this.isRegistering()) return;
    this.isRegistering.set(true);
    const requestPayload = {
      ...this.registerForm.getRawValue(),
      userName: this.registerForm.getRawValue().phoneNumber, 
    emailAddress: this.registerForm.getRawValue().phoneNumber + '@tabebify.com', 
      role: 'Patient', 
      gender: this.registerForm.getRawValue().gender
        ? Number(this.registerForm.getRawValue().gender)
        : null, 
      dateOfBirth: this.registerForm.getRawValue().dateOfBirth
        ? this.registerForm.getRawValue().dateOfBirth
        : null,
        
    };
    this.accountProxyService
      .register(requestPayload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isRegistering.set(false)),
      )
      .subscribe({
        next: (addedPatient) => {
          let newPatient = {...addedPatient, id: addedPatient.userId, fullName : this.registerForm.get('fullName')?.value }
          delete newPatient.userId
          this.users.update((list) => [newPatient, ...list]);
          this.totalCount.update((c) => c + 1);
          this.isRegisterModalOpen.set(false);
          toast.success(`Patient ${newPatient.fullName} registered successfully.`);
        },
        error: (err) =>
          toast.error(err?.error?.error?.message || 'Registration failed. Check your inputs.'),
      });
  }
}
