import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';

// Unique ID per instance for aria-labelledby targeting.
let _seed = 0;

@Component({
  selector: 'app-master-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericModalComponent],
  templateUrl: './master-detail-modal.component.html',
})
export class MasterDetailModalComponent {
  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly isOpen = input.required<boolean>();
  /** Drives the body/footer toggle between read-only view and edit form. */
  readonly isEditingMode = input<boolean>(false);
  /** Primary entity name shown in the header (e.g. "Dr. Sarah Johnson"). */
  readonly title = input.required<string>();
  /** Optional label rendered above the title (e.g. "Nurse Profile", "Invoice"). */
  readonly subtitle = input<string>('');
  /**
   * The `id` attribute of the projected `<form>` inside [edit-content].
   * Bridges the footer's submit button to the form across the slot boundary
   * using the native HTML `form` attribute.
   */
  readonly formId = input<string>('detail-form');
  readonly isSaving = input<boolean>(false);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly onClose = output<void>();
  readonly onEnterEdit = output<void>();
  readonly onCancelEdit = output<void>();
  /**
   * Fired when the Save button is clicked — in addition to triggering the
   * projected form's native (ngSubmit). Consumers can use either mechanism;
   * avoid binding both to the same handler to prevent double execution.
   */
  readonly onSave = output<void>();

  // ── Internals ─────────────────────────────────────────────────────────────
  readonly titleId = `master-detail-title-${++_seed}`;

  /** Header title switches between entity name (read) and "Edit …" (edit). */
  protected readonly headerTitle = computed(() =>
    this.isEditingMode() ? `Edit ${this.title()}` : this.title(),
  );
}
