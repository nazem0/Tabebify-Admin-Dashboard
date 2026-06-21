import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';


// Shared components
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { IdentityRoleService, IdentityRoleDto, IdentityRoleCreateDto } from '../../../proxy/volo/abp/identity';
import { PermissionGroupDto, PermissionsService, UpdatePermissionsDto } from '../../../proxy/volo/abp/permission-management';

// ABP permission provider constant
const PROVIDER_NAME = 'R'; // 'R' = Role provider in ABP

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ConfirmationModalComponent, ModalComponent],
  templateUrl: './settings.html',
})
export class SettingsComponent implements OnInit {
  private readonly roleProxy = inject(IdentityRoleService);
  private readonly permissionProxy = inject(PermissionsService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // ── Master data ───────────────────────────────────────────────────────────
  protected readonly roles = signal<IdentityRoleDto[]>([]);
  protected readonly permissionGroups = signal<PermissionGroupDto[]>([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  protected readonly selectedRoleName = signal<string>('');
  protected readonly searchQuery = signal<string>('');
  protected readonly isLoadingRoles = signal(false);
  protected readonly isLoadingPermissions = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isDirty = signal(false);

  // ── Expanded accordion groups ─────────────────────────────────────────────
  protected readonly expandedGroups = signal<Set<string>>(new Set());

  // ── Create role modal ─────────────────────────────────────────────────────
  protected readonly showCreateRoleModal = signal(false);
  protected readonly isCreatingRole = signal(false);

  protected readonly createRoleForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^\S+$/)]],
    isDefault: [false],
    isPublic: [false],
  });

  // ── Delete role ───────────────────────────────────────────────────────────
  protected readonly deleteTargetRole = signal<IdentityRoleDto | null>(null);
  protected readonly isDeletingRole = signal(false);
  protected readonly isDeleteRoleOpen = computed(() => this.deleteTargetRole() !== null);

  // ── Computed: filtered permission groups ──────────────────────────────────
  protected readonly filteredGroups = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.permissionGroups();

    return this.permissionGroups()
      .map(group => ({
        ...group,
        permissions: (group.permissions ?? []).filter(
          p =>
            p.displayName?.toLowerCase().includes(query) ||
            p.name?.toLowerCase().includes(query),
        ),
      }))
      .filter(group => group.permissions.length > 0);
  });

  // ── Computed: stats for footer bar ───────────────────────────────────────
  protected readonly activePermissionsCount = computed(() =>
    this.permissionGroups()
      .flatMap(g => g.permissions ?? [])
      .filter(p => p.isGranted).length,
  );

  protected readonly restrictedModulesCount = computed(() =>
    this.permissionGroups().filter(
      g => (g.permissions ?? []).every(p => !p.isGranted),
    ).length,
  );

  protected readonly complianceScore = computed(() => {
    const all = this.permissionGroups().flatMap(g => g.permissions ?? []);
    if (all.length === 0) return 0;
    return Math.round((all.filter(p => p.isGranted).length / all.length) * 100);
  });

  // ── Computed: "select all" state per group ────────────────────────────────
  protected isGroupAllSelected(groupName: string): boolean {
    const group = this.permissionGroups().find(g => g.name === groupName);
    if (!group?.permissions?.length) return false;
    return group.permissions.every(p => p.isGranted);
  }

  protected isGroupExpanded(groupName: string): boolean {
    return this.expandedGroups().has(groupName);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.isLoadingRoles.set(true);

    this.roleProxy
      .getList({ maxResultCount: 100, skipCount: 0 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingRoles.set(false)),
      )
      .subscribe({
        next: result => {
          this.roles.set(result.items ?? []);
          // Auto-select first role
          const first = result.items?.[0];
          if (first?.name) {
            this.loadRolePermissions(first.name);
          }
        },
        error: () => toast.error('Failed to load roles.'),
      });
  }

  // ── Load permissions for a role ───────────────────────────────────────────
  protected loadRolePermissions(roleName: string): void {
    if (this.selectedRoleName() === roleName && this.permissionGroups().length > 0) return;

    this.selectedRoleName.set(roleName);
    this.isDirty.set(false);
    this.searchQuery.set('');
    this.isLoadingPermissions.set(true);
    this.permissionGroups.set([]);

    this.permissionProxy
      .get(PROVIDER_NAME, roleName)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingPermissions.set(false)),
      )
      .subscribe({
        next: res => {
          const groups = res.groups ?? [];
          this.permissionGroups.set(groups);
          // Auto-expand all groups initially
          this.expandedGroups.set(new Set(groups.map(g => g.name ?? '')));
        },
        error: () => toast.error(`Failed to load permissions for "${roleName}".`),
      });
  }

  // ── Toggle single permission ──────────────────────────────────────────────
onTogglePermission(permissionName: string, isChecked: boolean) {
  console.log(`🎯 Toggle Clicked: ${permissionName} -> New State: ${isChecked}`);

  this.permissionGroups.update(groups => {
    return groups.map(group => {
      let updatedPermissions = group.permissions?.map((p: any) => 
        p.name === permissionName ? { ...p, isGranted: isChecked } : p
      );

      const currentPerm = group.permissions?.find((p: any) => p.name === permissionName);

      if (currentPerm) {
  
        updatedPermissions = updatedPermissions?.map((p: any) => {
          if (p.parentName === permissionName) {
            return { ...p, isGranted: isChecked };
          }
          return p;
        });

        if (isChecked && currentPerm.parentName) {
          updatedPermissions = updatedPermissions?.map((p: any) => {
            if (p.name === currentPerm.parentName) {
              return { ...p, isGranted: true };
            }
            return p;
          });
        }
      }

      return { ...group, permissions: updatedPermissions };
    });
  });

  this.isDirty.set(true);
}

  // ── Toggle all permissions in a group ─────────────────────────────────────
  protected toggleSelectAll(groupName: string, isChecked: boolean): void {
    this.isDirty.set(true);
    this.permissionGroups.update(groups =>
      groups.map(group =>
        group.name === groupName
          ? {
              ...group,
              permissions: (group.permissions ?? []).map(p => ({ ...p, isGranted: isChecked })),
            }
          : group,
      ),
    );
  }

  // ── Toggle accordion expand/collapse ──────────────────────────────────────
  protected toggleGroupExpand(groupName: string): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      next.has(groupName) ? next.delete(groupName) : next.add(groupName);
      return next;
    });
  }

  // ── Save changes ──────────────────────────────────────────────────────────
  protected onSaveChanges(): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const payload: UpdatePermissionsDto = {
      permissions: this.permissionGroups()
        .flatMap(g => g.permissions ?? [])
        .map(p => ({ name: p.name ?? '', isGranted: p.isGranted ?? false })),
    };

    this.permissionProxy
      .update(PROVIDER_NAME, this.selectedRoleName(), payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.isDirty.set(false);
          toast.success(`Role '${this.selectedRoleName()}' permissions have been updated successfully.`);
        },
        error: err =>
          toast.error(err?.error?.error?.message ?? 'Failed to save permissions.'),
      });
  }

  // ── Discard changes ───────────────────────────────────────────────────────
  protected onDiscard(): void {
    this.loadRolePermissions(this.selectedRoleName());
  }

  // ── Create role ───────────────────────────────────────────────────────────
  protected onOpenCreateRole(): void {
    this.createRoleForm.reset({ name: '', isDefault: false, isPublic: false });
    this.showCreateRoleModal.set(true);
  }

  protected onCloseCreateRole(): void {
    this.showCreateRoleModal.set(false);
  }

  protected onSubmitCreateRole(): void {
    if (this.createRoleForm.invalid || this.isCreatingRole()) return;
    this.isCreatingRole.set(true);

    const raw = this.createRoleForm.getRawValue();
    const dto: IdentityRoleCreateDto = {
      name: raw.name!,
      isDefault: raw.isDefault ?? false,
      isPublic: raw.isPublic ?? false,
    };

    this.roleProxy
      .create(dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCreatingRole.set(false)),
      )
      .subscribe({
        next: created => {
          this.roles.update(list => [...list, created]);
          this.showCreateRoleModal.set(false);
          toast.success(`Role "${created.name}" created successfully.`);
          this.loadRolePermissions(created.name!);
        },
        error: err =>
          toast.error(err?.error?.error?.message ?? 'Failed to create role.'),
      });
  }

  // ── Delete role ───────────────────────────────────────────────────────────
  protected onRequestDeleteRole(role: IdentityRoleDto, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteTargetRole.set(role);
  }

  protected onCancelDeleteRole(): void {
    this.deleteTargetRole.set(null);
  }

  protected onConfirmDeleteRole(): void {
    const role = this.deleteTargetRole();
    if (!role?.id) return;
    this.isDeletingRole.set(true);

    this.roleProxy
      .delete(role.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDeletingRole.set(false)),
      )
      .subscribe({
        next: () => {
          this.deleteTargetRole.set(null);
          this.roles.update(list => list.filter(r => r.id !== role.id));
          if (this.selectedRoleName() === role.name) {
            this.selectedRoleName.set('');
            this.permissionGroups.set([]);
            const first = this.roles()[0];
            if (first?.name) this.loadRolePermissions(first.name);
          }
          toast.success(`Role "${role.name}" deleted.`);
        },
        error: () => toast.error('Failed to delete role.'),
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Icon per group name — graceful fallback */
  protected groupIcon(groupName: string): string {
    const name = groupName.toLowerCase();
    if (name.includes('medical') || name.includes('service')) return 'stethoscope';
    if (name.includes('clinical') || name.includes('emr') || name.includes('record')) return 'folder_shared';
    if (name.includes('patient')) return 'person';
    if (name.includes('admin') || name.includes('system')) return 'admin_panel_settings';
    if (name.includes('booking') || name.includes('appointment')) return 'event';
    if (name.includes('payment') || name.includes('finance')) return 'payments';
    if (name.includes('report') || name.includes('analytic')) return 'bar_chart';
    if (name.includes('user') || name.includes('role')) return 'manage_accounts';
    return 'lock';
  }

  /** Role icon — picks a material symbol based on role name */
  protected roleIcon(roleName: string): string {
    const name = (roleName ?? '').toLowerCase();
    if (name.includes('admin') || name.includes('super')) return 'shield';
    if (name.includes('doctor') || name.includes('physician')) return 'medical_services';
    if (name.includes('nurse')) return 'personal_injury';
    if (name.includes('reception')) return 'badge';
    if (name.includes('finance') || name.includes('account')) return 'account_balance';
    if (name.includes('lab')) return 'biotech';
    return 'group';
  }

  protected trackByName(_: number, item: { name?: string }): string {
    return item.name ?? '';
  }

  /**
   * ABP PermissionDto doesn't ship a description field.
   * We derive a human-readable hint from the permission name segments.
   * e.g. "AbpIdentity.Users.Create" → "Create access for Users."
   */
  protected buildPermissionDescription(perm: PermissionGroupDto): string {
    const name = perm.displayName ?? perm.name ?? '';
    const parts = name.split(/[.\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const action = parts[parts.length - 1];
      const resource = parts[parts.length - 2];
      return `${action} access for ${resource}.`;
    }
    return `Grants the ability to perform: ${name}.`;
  }

  
}