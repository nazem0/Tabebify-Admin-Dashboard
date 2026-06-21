import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { FormFieldComponent } from '../../../../../shared/components/form-field/form-field';
import { AccountService } from '../../../../../proxy/auth';
import { Gender } from '../../../../../proxy/profiles/gender.enum';

/**
 * Self-contained "Add New Nurse" form.
 *
 * Owns the FormGroup, submission logic, and API call.
 * ProvidersComponent receives (nurseCreated) and reloads the pending list.
 * This decouples form validation and API concerns from the shell component.
 */
@Component({
  selector: 'app-nurse-create-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './nurse-create-form.html',
})
export class NurseCreateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input.required<boolean>();

  readonly nurseCreated = output<void>();
  readonly closed = output<void>();

  protected readonly Gender = Gender;

  protected readonly form = this.fb.nonNullable.group({
    fullName:     ['', Validators.required],
    userName:     ['', Validators.required],
    emailAddress: ['', [Validators.required, Validators.email]],
    password:     ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber:  ['', Validators.required],
    dateOfBirth:  [''],
    gender:       [Gender.Female],
  });

  protected readonly isSubmitting = signal(false);
  protected readonly createError = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.createError.set(null);
    const v = this.form.getRawValue();

    this.accountService
      .register({
        userName: v.userName,
        emailAddress: v.emailAddress,
        password: v.password,
        fullName: v.fullName,
        phoneNumber: v.phoneNumber,
        dateOfBirth: v.dateOfBirth || undefined,
        gender: v.gender,
        role: 'Nurse',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form.reset({ gender: Gender.Female });
          toast.success('Nurse account created successfully.');
          this.nurseCreated.emit();
        },
        error: () => {
          this.createError.set('Failed to create nurse account. Please check the details and try again.');
          this.isSubmitting.set(false);
        },
      });
  }

  protected close(): void {
    this.form.reset({ gender: Gender.Female });
    this.createError.set(null);
    this.closed.emit();
  }
}
