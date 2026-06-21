import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericModalComponent } from '../../../../../shared/components/generic-modal/generic-modal.component';
import { FormFieldComponent } from '../../../../../shared/components/form-field/form-field';
import type { CreateServiceCategoryDto, ServiceCategoryDto } from '../../../../../proxy/services';

const MATERIAL_ICONS = [
  { value: 'medical_services', label: 'Medical Services' },
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'healing', label: 'Healing' },
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'prescriptions', label: 'Prescriptions' },
  { value: 'bloodtype', label: 'Blood / Lab' },
  { value: 'radiology', label: 'Radiology / X-Ray' },
  { value: 'surgical', label: 'Surgery' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
];

@Component({
  selector: 'app-category-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericModalComponent, FormFieldComponent, ReactiveFormsModule],
  templateUrl: './category-modal.html'
})
export class CategoryModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input<boolean>(false);
  readonly category = input<ServiceCategoryDto | null>(null);

  // Extend output with isActive pseudo-property for UI simulation
  readonly submitted = output<CreateServiceCategoryDto & { isActive?: boolean }>();
  readonly closed = output<void>();

  private readonly fb = inject(FormBuilder);
  
  protected readonly materialIcons = MATERIAL_ICONS;

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    iconUrl: [''],
    isActive: [true] // Simulation flag
  });

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat) {
        // DTO doesn't have isActive currently, assume true if not present, but simulate for edits
        // @ts-ignore - simulating property
        const simulatedIsActive = cat['isActive'] ?? true;
        this.form.patchValue({ 
          name: cat.name ?? '', 
          iconUrl: cat.iconUrl ?? '',
          isActive: simulatedIsActive
        });
      } else {
        if (!this.isOpen()) {
          this.form.reset({ name: '', iconUrl: '', isActive: true });
        }
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
      iconUrl: val.iconUrl ?? undefined,
      isActive: val.isActive ?? true
    });
  }

  handleClose(): void {
    this.form.reset({ name: '', iconUrl: '', isActive: true });
    this.closed.emit();
  }
}
