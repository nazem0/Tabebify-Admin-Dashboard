import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { AdminDocumentDto } from '../admin/models';
import type { RejectUserDocumentDto } from '../dtos/user-documents/models';

@Injectable({
  providedIn: 'root',
})
export class AdminUserDocumentsService {
  private restService = inject(RestService);
  apiName = 'Default';

  approve = (id: string, ct?: any, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdminDocumentDto>(
      {
        method: 'POST',
        url: `/api/admin/documents/${id}/approve`,
      },
      { apiName: this.apiName, ...config },
    );

  reject = (id: string, input: RejectUserDocumentDto, ct?: any, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdminDocumentDto>(
      {
        method: 'POST',
        url: `/api/admin/documents/${id}/reject`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
