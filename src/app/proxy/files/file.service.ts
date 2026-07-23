import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { UploadBase64Input, UploadFileResultDto } from '../dtos/files/models';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private restService = inject(RestService);
  apiName = 'Default';

  get = (storageName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>(
      {
        method: 'GET',
        responseType: 'blob',
        url: '/api/app/file',
        params: { storageName },
      },
      { apiName: this.apiName, ...config },
    );

  upload = (file: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UploadFileResultDto>(
      {
        method: 'POST',
        url: '/api/app/file/upload',
        body: file,
      },
      { apiName: this.apiName, ...config },
    );

  uploadBase64 = (input: UploadBase64Input, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UploadFileResultDto>(
      {
        method: 'POST',
        url: '/api/app/file/upload-base64',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
