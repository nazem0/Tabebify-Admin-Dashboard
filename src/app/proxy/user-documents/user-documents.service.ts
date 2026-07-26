import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { UserDocumentDetailsDto } from '../dtos/user-documents/models';

@Injectable({
  providedIn: 'root',
})
export class UserDocumentsService {
  private restService = inject(RestService);
  apiName = 'Default';

  getMyDocuments = (ct?: any, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<UserDocumentDetailsDto>>(
      {
        method: 'GET',
        url: '/api/app/user-documents/my-documents',
      },
      { apiName: this.apiName, ...config },
    );

  upsertMyDocuments = (input: UserDocumentDetailsDto[], ct?: any, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<UserDocumentDetailsDto>>(
      {
        method: 'POST',
        url: '/api/app/user-documents/upsert-my-documents',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
