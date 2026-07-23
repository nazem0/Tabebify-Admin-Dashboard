import type { DocumentType } from '../../user-documents/document-type.enum';
import type { DocumentStatus } from '../../user-documents/document-status.enum';

export interface UserDocumentDetailsDto {
  id?: string;
  documentType?: DocumentType;
  fileUrl?: string;
  status?: DocumentStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  creationTime?: string;
  lastModificationTime?: string;
}

export interface UserDocumentDto {
  documentType?: DocumentType;
  fileUrl?: string;
}
