import type { ProviderVerificationDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProviderVerificationService {
  private restService = inject(RestService);
  apiName = 'Default';

  processVerification = (input: ProviderVerificationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/provider-verification/process-verification',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
