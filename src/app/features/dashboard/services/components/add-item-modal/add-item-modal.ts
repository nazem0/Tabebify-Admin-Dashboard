import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericModalComponent } from '../../../../../shared/components/generic-modal/generic-modal.component';
import { FormFieldComponent } from '../../../../../shared/components/form-field/form-field';
import type { ItemDto } from '../../../../../proxy/services/models';

export type AddItemMode = 'existing' | 'new' | 'edit';

export interface AddItemSubmitPayload {
  mode: AddItemMode;
  itemId?: string;
  quantity: number;
  name?: string;
  defaultPrice?: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-add-item-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericModalComponent, FormFieldComponent, ReactiveFormsModule],
  templateUrl:'./add-item-modal.html'
})
export class AddItemModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly isSubmittingItem = input<boolean>(false);
  readonly itemToResponseLookup = input.required<ItemDto[]>();
  readonly editItemTarget = input<ItemDto | null>(null);

  readonly submitted = output<AddItemSubmitPayload>();
  readonly closed = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly isCreatingNew = signal(false);

  readonly addItemForm = this.fb.group({
    itemId: [''],
    name: ['', [Validators.maxLength(128)]],
    defaultPrice: [0, [Validators.min(0.01)]],
    isActive: [true],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const target = this.editItemTarget();
      if (target) {
        this.isCreatingNew.set(false);
        this.addItemForm.patchValue({
          itemId: target.id,
          name: target.name ?? '',
          defaultPrice: target.price ?? 0,
          isActive: target.isActive ?? true,
          quantity: target.defaultQuantity ?? 1,
        });
      } else {
        // Reset when opening as add new (not strictly needed here as handleClose does it, but good for safety)
        if (!this.isOpen()) {
          this.addItemForm.reset({ itemId: '', name: '', defaultPrice: 0, isActive: true, quantity: 1 });
          this.isCreatingNew.set(false);
        }
      }
    });
  }

  protected onSubmit(): void {
    const isEditing = !!this.editItemTarget();
    const isNew = this.isCreatingNew();
    
    if (isEditing || isNew) {
      this.addItemForm.controls.name.setValidators([Validators.required, Validators.maxLength(128)]);
      this.addItemForm.controls.defaultPrice.setValidators([Validators.required, Validators.min(0.01)]);
      this.addItemForm.controls.itemId.clearValidators();
    } else {
      this.addItemForm.controls.itemId.setValidators([Validators.required]);
      this.addItemForm.controls.name.clearValidators();
      this.addItemForm.controls.defaultPrice.clearValidators();
    }
    
    this.addItemForm.controls.name.updateValueAndValidity();
    this.addItemForm.controls.defaultPrice.updateValueAndValidity();
    this.addItemForm.controls.itemId.updateValueAndValidity();

    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      return;
    }

    const val = this.addItemForm.getRawValue();
    
    let mode: AddItemMode = 'existing';
    if (isEditing) mode = 'edit';
    else if (isNew) mode = 'new';

    this.submitted.emit({
      mode,
      itemId: val.itemId ?? undefined,
      quantity: val.quantity!,
      name: val.name ?? undefined,
      defaultPrice: val.defaultPrice ?? undefined,
      isActive: val.isActive ?? true
    });
  }

  protected handleClose(): void {
    this.addItemForm.reset({ itemId: '', name: '', defaultPrice: 0, isActive: true, quantity: 1 });
    this.isCreatingNew.set(false);
    this.closed.emit();
  }
}