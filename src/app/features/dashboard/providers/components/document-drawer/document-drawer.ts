import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import type { AdminProviderListDto } from '../../../../../proxy/admin';
import type { AdminDocumentDto } from '../../../../../proxy/admin/models';
@Component({
  selector: 'app-document-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, AppInitialsPipe, AppDatePipe],
  templateUrl: './document-drawer.html',
})
export class DocumentDrawerComponent {
  readonly isOpen = input<boolean>(false);
  readonly provider = input<AdminProviderListDto | null>(null);
  readonly documents = input<AdminDocumentDto[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly close = output<void>();

  protected isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  }
}
