import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import type { UserDisplayDto, UserBookingItem, UserPaymentItem } from '../../models/user-display.dto';

@Component({
  selector: 'app-user-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ReactiveFormsModule, AppInitialsPipe, AppDatePipe],
  templateUrl: './user-detail-modal.html',
})
export class UserDetailModalComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly isOpen          = input.required<boolean>();
  readonly user            = input<UserDisplayDto | null>(null);
  readonly isActive        = input<boolean>(true);
  readonly bookings        = input<UserBookingItem[]>([]);
  readonly payments        = input<UserPaymentItem[]>([]);
  readonly isDetailLoading = input<boolean>(false);
  readonly isEditingMode   = input<boolean>(false);
  readonly editForm        = input<FormGroup | null>(null);
  readonly isSaving        = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly close      = output<void>();
  readonly enterEdit  = output<void>();
  readonly cancelEdit = output<void>();
  readonly saveEdit   = output<void>();
}
