import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import type { UserDisplayDto, UserBookingItem, UserPaymentItem } from '../../models/user-display.dto';

@Component({
  selector: 'app-user-profile-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppInitialsPipe],
  templateUrl: './user-profile-panel.html',
})
export class UserProfilePanelComponent {
  readonly user     = input<UserDisplayDto | null>(null);
  readonly isOpen   = input.required<boolean>();
  readonly isActive = input<boolean>(true);
  readonly bookings = input<UserBookingItem[]>([]);
  readonly payments = input<UserPaymentItem[]>([]);

  readonly close     = output<void>();
  readonly blockUser = output<UserDisplayDto>();
  readonly editUser  = output<UserDisplayDto>();

  protected readonly patientShortId = computed(() => {
    const id = this.user()?.id ?? '';
    return `#TAB-${id.replace(/-/g, '').slice(0, 5).toUpperCase()}`;
  });

  protected readonly blockLabel = computed(() =>
    this.isActive() ? 'Block User' : 'Unblock User',
  );
}
