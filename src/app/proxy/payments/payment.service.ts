import type { InitiatePaymentDto, InitiatePaymentResultDto, PaymentWebhookDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private restService = inject(RestService);
  apiName = 'Default';

  initiate = (input: InitiatePaymentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, InitiatePaymentResultDto>(
      {
        method: 'POST',
        url: '/api/app/payment/initiate',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  webhook = (input: PaymentWebhookDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/payment/webhook',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
