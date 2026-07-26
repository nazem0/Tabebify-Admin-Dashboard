import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import { DocumentStatus } from '../../../../../proxy/user-documents';
import type { AdminProviderListDto } from '../../../../../proxy/admin';
import type { AdminDocumentDto } from '../../../../../proxy/admin/models';

@Component({
  selector: 'app-document-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, AppInitialsPipe, AppDatePipe, FormsModule],
  templateUrl: './document-drawer.html',
})
export class DocumentDrawerComponent {
  readonly isOpen = input<boolean>(false);
  readonly provider = input<AdminProviderListDto | null>(null);
  readonly documents = input<AdminDocumentDto[]>([]);
  readonly isLoading = input<boolean>(false);
  /** Document currently being approved/rejected. */
  readonly processingDocId = input<string | null>(null);

  readonly close = output<void>();
  readonly approveDocument = output<AdminDocumentDto>();
  readonly rejectDocument = output<{ document: AdminDocumentDto; rejectionReason: string }>();

  /** Which document is showing the inline reject form (null = none). */
  protected readonly rejectingDocId = signal<string | null>(null);
  protected readonly rejectionReason = signal('');

  protected isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  }

  protected isPending(doc: AdminDocumentDto): boolean {
    return this.normalizeStatus(doc.status) === DocumentStatus.Pending;
  }

  protected isProcessing(doc: AdminDocumentDto): boolean {
    return !!doc.id && this.processingDocId() === doc.id;
  }

  protected startReject(doc: AdminDocumentDto): void {
    if (!doc.id || this.processingDocId()) return;
    this.rejectingDocId.set(doc.id);
    this.rejectionReason.set('');
  }

  protected cancelReject(): void {
    this.rejectingDocId.set(null);
    this.rejectionReason.set('');
  }

  protected confirmReject(doc: AdminDocumentDto): void {
    const reason = this.rejectionReason().trim();
    if (!doc.id || !reason || this.processingDocId()) return;
    this.rejectDocument.emit({ document: doc, rejectionReason: reason });
    this.cancelReject();
  }

  protected onApprove(doc: AdminDocumentDto): void {
    if (!doc.id || this.processingDocId()) return;
    this.cancelReject();
    this.approveDocument.emit(doc);
  }

  private normalizeStatus(status: string | number | undefined | null): DocumentStatus | null {
    if (status === undefined || status === null || status === '') return null;
    if (typeof status === 'number') return status as DocumentStatus;

    const raw = String(status).trim();
    if (/^\d+$/.test(raw)) return Number(raw) as DocumentStatus;

    switch (raw.toLowerCase()) {
      case 'pending':
        return DocumentStatus.Pending;
      case 'approved':
        return DocumentStatus.Approved;
      case 'rejected':
        return DocumentStatus.Rejected;
      case 'additionalrequested':
      case 'additional_requested':
        return DocumentStatus.AdditionalRequested;
      default:
        return null;
    }
  }
}
