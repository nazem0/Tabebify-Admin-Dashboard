import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import type { AdminProviderListDto } from '../../../../../proxy/admin';

@Component({
  selector: 'app-pending-nurse-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppInitialsPipe, AppDatePipe],
  templateUrl: './pending-nurse-list.html',
})
export class PendingNurseListComponent {
  readonly providers = input.required<AdminProviderListDto[]>();
  readonly isLoading = input<boolean>(false);
  readonly verifyingId = input<string | null>(null);

  readonly approve = output<AdminProviderListDto>();
  readonly reject = output<AdminProviderListDto>();
  readonly viewDocuments = output<AdminProviderListDto>();

  protected isVerifying(provider: AdminProviderListDto): boolean {
    return this.verifyingId() === provider.id;
  }
}
