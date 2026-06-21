import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { AdminDashboardService, AdminProviderListDto } from '../../../proxy/admin';
import type { AdminDocumentDto } from '../../../proxy/admin/models';
import { ProviderVerificationService, VerificationAction } from '../../../proxy/auth';
import { IdentityUserService } from '../../../proxy/volo/abp/identity';
import { UserStatusService } from '../../../core/services/user-status/user-status.service';
import { AnalyticsCacheService } from '../../../core/services/analytics/analytics-cache.service';

import { ModalComponent } from '../../../shared/components/modal/modal';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { PendingNurseListComponent } from './components/pending-nurse-list/pending-nurse-list';
import { DocumentDrawerComponent } from './components/document-drawer/document-drawer';
import { NurseCreateFormComponent } from './components/nurse-create-form/nurse-create-form';
import { NurseProfileModalComponent } from './components/nurse-profile-modal/nurse-profile-modal';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { TableColumn } from '../../../shared/components/generic-table/table-column.model';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-providers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModalComponent,
    ConfirmationModalComponent,
    PendingNurseListComponent,
    DocumentDrawerComponent,
    NurseCreateFormComponent,
    NurseProfileModalComponent,
    GenericTableComponent
],
  templateUrl: './providers.html',
})
export class ProvidersComponent {
protected readonly cols: TableColumn[] = [
  {
    field: 'fullName',
    header: 'Nurse',
    type: 'avatar',
    subtitleField: 'email', 
  },
  {
    field: 'ratingAverage',
    header: 'Rating',
    type: 'rating', 
  },
  {
    field: 'accountStatus', 
    header: 'Account Status',
    type: 'badge',
    scheme: 'provider',
    valueResolver: (row: AdminProviderListDto) => (row.isAccountActive ? 'active' : 'blocked'), 
  },
  {
    field: 'isAvailable', 
    header: 'Is Active',
    type: 'badge',
    scheme: 'provider',
    valueResolver: (row: AdminProviderListDto) => row.isAvailable ? 'active' : 'inactive',
  },
  {
    field: 'createdAt',
    header: 'Joined',
    type: 'date',
    responsiveClass: 'hidden lg:table-cell',
  },
  {
    field: '_actions',
    header: 'Actions',
    type: 'actions',
    skipExport: true, 
    actions: {showBlock : true, showEdit: true, showDelete: true, showResetPassword: true, showView: true}
  }
];
  private readonly adminService = inject(AdminDashboardService);
  private readonly analyticsCache = inject(AnalyticsCacheService);
  private readonly verificationService = inject(ProviderVerificationService);
  private readonly identityService = inject(IdentityUserService);
  private readonly userStatusService = inject(UserStatusService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 10;

  protected readonly activeProviders = signal<AdminProviderListDto[]>([]);
  protected readonly pendingProviders = signal<AdminProviderListDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pendingCount = signal(0);
  protected readonly totalStaff = signal(0);
  protected readonly isLoadingActive = signal(true);
  protected readonly isLoadingPending = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly search = signal('');
  protected readonly verifyingId = signal<string | null>(null);

  protected readonly nurseActiveStates = signal<Map<string, boolean>>(new Map());
  protected readonly togglingNurseId = signal<string | null>(null);

  protected readonly docProvider = signal<AdminProviderListDto | null>(null);
  protected readonly documents = signal<AdminDocumentDto[]>([]);
  protected readonly isLoadingDocs = signal(false);

  protected readonly showCreateModal = signal(false);

  protected readonly requestDocsTarget = signal<AdminProviderListDto | null>(null);
  protected readonly isRequestingDocs = signal(false);

  protected readonly profileProvider = signal<AdminProviderListDto | null>(null);

  protected readonly deleteNurseTarget = signal<AdminProviderListDto | null>(null);
  protected readonly isDeletingNurse = signal(false);

  constructor() {
    this.loadActiveNurses();
    this.loadPendingNurses();

    // Reads from the shared cache — no extra HTTP call.
    this.analyticsCache.analytics$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => this.totalStaff.set(data.totalNurses ?? 0) });
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  protected loadActiveNurses(): void {
    this.isLoadingActive.set(true);
    this.error.set(null);
    this.adminService
      .getProviders({
        status: 'Active',
        filter: this.search() || undefined,
        skipCount: this.page() * this.pageSize,
        maxResultCount: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.activeProviders.set(result.items ?? []);
          this.totalCount.set(result.totalCount ?? 0);
          this.isLoadingActive.set(false);
        },
        error: () => {
          this.error.set('Failed to load nurses. Please refresh the page.');
          this.isLoadingActive.set(false);
        },
      });
  }

  protected loadPendingNurses(): void {
    this.isLoadingPending.set(true);
    this.adminService
      .getProviders({ status: 'PendingReview', maxResultCount: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.pendingProviders.set(result.items ?? []);
          this.pendingCount.set(result.totalCount ?? 0);
          this.isLoadingPending.set(false);
        },
        error: () => this.isLoadingPending.set(false),
      });
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
    this.loadActiveNurses();
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    this.page.set(Math.floor((event.first ?? 0) / this.pageSize));
    this.loadActiveNurses();
  }


  // ── Approve / Reject ──────────────────────────────────────────────────────

  protected approve(provider: AdminProviderListDto): void {
    if (!provider.id || this.verifyingId()) return;
    this.verifyingId.set(provider.id);
    this.verificationService
      .processVerification({ providerId: provider.id, action: VerificationAction.Approve })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.verifyingId.set(null)))
      .subscribe({
        next: () => {
          this.pendingProviders.update(list => list.filter(p => p.id !== provider.id));
          this.pendingCount.update(c => Math.max(0, c - 1));
          toast.success(`${provider.fullName ?? 'Nurse'} approved.`);
          this.loadActiveNurses();
        },
        error: () => toast.error('Failed to approve. Please try again.'),
      });
  }

  protected reject(provider: AdminProviderListDto): void {
    if (!provider.id || this.verifyingId()) return;
    this.verifyingId.set(provider.id);
    this.verificationService
      .processVerification({ providerId: provider.id, action: VerificationAction.Reject })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.verifyingId.set(null)))
      .subscribe({
        next: () => {
          this.pendingProviders.update(list => list.filter(p => p.id !== provider.id));
          this.pendingCount.update(c => Math.max(0, c - 1));
          toast.success(`${provider.fullName ?? 'Nurse'} rejected.`);
        },
        error: () => toast.error('Failed to reject. Please try again.'),
      });
  }

  // ── Block / Unblock — UserStatusService + switchMap (no nested subscribes) ──

  protected toggleBlock(nurse: AdminProviderListDto): void {
    if (!nurse.id || this.togglingNurseId()) return;
    this.togglingNurseId.set(nurse.id);

    this.userStatusService
      .toggleActive(nurse.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.togglingNurseId.set(null)),
      )
      .subscribe({
        next: newActive => {
          this.nurseActiveStates.update(m => new Map(m).set(nurse.id!, newActive));
          toast.success(
            newActive
              ? `${nurse.fullName ?? 'Nurse'} has been unblocked.`
              : `${nurse.fullName ?? 'Nurse'} has been blocked.`,
          );
        },
        error: () => toast.error('Failed to update nurse status. Please try again.'),
      });
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  protected openDocuments(provider: AdminProviderListDto): void {
    if (!provider.id) return;
    this.profileProvider.set(null);
    this.docProvider.set(provider);
    this.documents.set([]);
    this.isLoadingDocs.set(true);
    this.adminService.getProviderDocuments(provider.id).subscribe({
      next: result => {
        this.documents.set(result.items ?? []);
        this.isLoadingDocs.set(false);
      },
      error: () => this.isLoadingDocs.set(false),
    });
  }

  protected closeDocuments(): void {
    this.docProvider.set(null);
    this.documents.set([]);
  }

  // ── Create Nurse — form state owned by NurseCreateFormComponent ───────────

  protected openCreateModal(): void { this.showCreateModal.set(true); }
  protected closeCreateModal(): void { this.showCreateModal.set(false); }

  // Called when NurseCreateFormComponent emits (nurseCreated).
  protected onNurseCreated(): void {
    this.showCreateModal.set(false);
    this.loadPendingNurses();
  }

  // ── Request Documents ─────────────────────────────────────────────────────

  protected openRequestDocs(provider: AdminProviderListDto): void { this.requestDocsTarget.set(provider); }
  protected cancelRequestDocs(): void { this.requestDocsTarget.set(null); }

  protected confirmRequestDocs(): void {
    const target = this.requestDocsTarget();
    if (!target?.id || this.isRequestingDocs()) return;
    this.isRequestingDocs.set(true);
    this.verificationService
      .processVerification({ providerId: target.id, action: VerificationAction.RequestDocuments })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isRequestingDocs.set(false)))
      .subscribe({
        next: () => {
          this.requestDocsTarget.set(null);
          toast.success('Document request sent.');
        },
        error: () => {
          this.requestDocsTarget.set(null);
          toast.error('Failed to send request. Please try again.');
        },
      });
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  protected openProfile(provider: AdminProviderListDto): void { this.profileProvider.set(provider); }
  protected closeProfile(): void { this.profileProvider.set(null); }

  // ── Delete Nurse ──────────────────────────────────────────────────────────

  protected openDeleteNurse(nurse: AdminProviderListDto): void { this.deleteNurseTarget.set(nurse); }
  protected cancelDeleteNurse(): void { this.deleteNurseTarget.set(null); }

  protected confirmDeleteNurse(): void {
    const target = this.deleteNurseTarget();
    if (!target?.id || this.isDeletingNurse()) return;
    this.isDeletingNurse.set(true);
    this.identityService
      .delete(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isDeletingNurse.set(false)))
      .subscribe({
        next: () => {
          this.activeProviders.update(list => list.filter(p => p.id !== target.id));
          this.totalCount.update(c => Math.max(0, c - 1));
          this.deleteNurseTarget.set(null);
          toast.success(`${target.fullName ?? 'Nurse'} deleted.`);
        },
        error: () => {
          this.deleteNurseTarget.set(null);
          toast.error('Failed to delete nurse. Please try again.');
        },
      });
  }

  
}
