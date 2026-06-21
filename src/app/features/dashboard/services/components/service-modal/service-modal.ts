import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericModalComponent } from '../../../../../shared/components/generic-modal/generic-modal.component';
import { FormFieldComponent } from '../../../../../shared/components/form-field/form-field';
import type { ServiceDto } from '../../../../../proxy/services/models';

export interface ServiceSubmitPayload {
  name: string;
  price: number;
  durationMinutes: number;
  isVerified: boolean;
}

@Component({
  selector: 'app-service-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericModalComponent, FormFieldComponent, ReactiveFormsModule],
  templateUrl: './service-modal.html',
})
export class ServiceModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input<boolean>(false);
  readonly service = input<ServiceDto | null>(null);

  readonly submitted = output<ServiceSubmitPayload>();
  readonly closed = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    isVerified: [true]
  });

  constructor() {
    effect(() => {
      const target = this.service();
      const open = this.isOpen();

      if (target && open) {
        this.form.patchValue({
          name: target.name ?? '',
          price: target.price ?? 0,
          durationMinutes: target.durationMinutes ?? 30,
          isVerified: target.isVerified ?? true
        });
      } 
      else if (!target && open) {
        this.form.reset({ name: '', price: 0, durationMinutes: 30, isVerified: true });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    this.submitted.emit({
      name: val.name!,
      price: val.price!,
      durationMinutes: val.durationMinutes!,
      isVerified: val.isVerified ?? true
    });
  }

  handleClose(): void {
    this.form.reset({ name: '', price: 0, durationMinutes: 30, isVerified: true });
    this.closed.emit();
  }
}