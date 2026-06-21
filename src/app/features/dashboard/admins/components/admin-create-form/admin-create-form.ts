import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
  input,
  output,
  OnChanges,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { IdentityUserService } from '../../../../../proxy/volo/abp/identity/identity-user.service';
import type { IdentityUserDto, IdentityRoleDto } from '../../../../../proxy/volo/abp/identity/models';

@Component({
  selector: 'app-admin-create-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-create-form.html',
})
export class AdminCreateFormComponent implements OnChanges {
  private readonly userService = inject(IdentityUserService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly admin = input<IdentityUserDto | null>(null);
  readonly isOpen = input.required<boolean>();

  readonly adminSaved = output<IdentityUserDto>();
  readonly closed = output<void>();

  protected readonly isEditMode = computed(() => !!this.admin());
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingRoles = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly assignableRoles = signal<IdentityRoleDto[]>([]);
  protected readonly selectedRoleNames = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    userName:  ['', [Validators.required, Validators.minLength(3)]],
    name:      [''],
    surname:   [''],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    isActive:  [true],
  });

  ngOnChanges(): void {
    if (this.isOpen()) {
      this.loadRoles();
    }

    const admin = this.admin();
    if (admin) {
      this.form.patchValue({
        userName: admin.userName ?? '',
        name:     admin.name    ?? '',
        surname:  admin.surname ?? '',
        email:    admin.email   ?? '',
        password: '',
        isActive: admin.isActive ?? true,
      });
      // Password is optional when editing
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();

      if (admin.id) {
        this.userService.getRoles(admin.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: r => this.selectedRoleNames.set(
              (r.items ?? []).map(role => role.name ?? '').filter(Boolean),
            ),
          });
      }
    } else {
      this.form.reset({ userName: '', name: '', surname: '', email: '', password: '', isActive: true });
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.password.updateValueAndValidity();
      this.selectedRoleNames.set([]);
    }

    this.error.set(null);
  }

  private loadRoles(): void {
    if (this.assignableRoles().length) return;
    this.isLoadingRoles.set(true);
    this.userService.getAssignableRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => {
          this.assignableRoles.set(r.items ?? []);
          this.isLoadingRoles.set(false);
        },
        error: () => this.isLoadingRoles.set(false),
      });
  }

  protected toggleRole(roleName: string): void {
    this.selectedRoleNames.update(names =>
      names.includes(roleName)
        ? names.filter(n => n !== roleName)
        : [...names, roleName],
    );
  }

  protected isRoleSelected(roleName: string): boolean {
    return this.selectedRoleNames().includes(roleName);
  }

  protected onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const roleNames = this.selectedRoleNames();
    const admin = this.admin();

    if (admin?.id) {
      this.userService
        .update(admin.id, {
          userName:  v.userName,
          name:      v.name    || undefined,
          surname:   v.surname || undefined,
          email:     v.email,
          password:  v.password || undefined,
          isActive:  v.isActive,
          roleNames,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: updated => {
            this.isSubmitting.set(false);
            toast.success('"' + updated.userName + '" updated.');
            this.adminSaved.emit(updated);
          },
          error: () => {
            this.error.set('Failed to update admin. Please try again.');
            this.isSubmitting.set(false);
          },
        });
    } else {
      this.userService
        .create({
          userName:  v.userName,
          name:      v.name    || undefined,
          surname:   v.surname || undefined,
          email:     v.email,
          password:  v.password,
          isActive:  v.isActive,
          roleNames,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: created => {
            this.isSubmitting.set(false);
            toast.success('Admin "' + created.userName + '" created.');
            this.adminSaved.emit(created);
          },
          error: () => {
            this.error.set('Failed to create admin. Please try again.');
            this.isSubmitting.set(false);
          },
        });
    }
  }

  protected close(): void {
    this.form.reset();
    this.error.set(null);
    this.closed.emit();
  }
}
