import type { CreatePatientPaymentMethodDto, PatientPaymentMethodDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PatientPaymentMethodService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (input: CreatePatientPaymentMethodDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PatientPaymentMethodDto>(
      {
        method: 'POST',
        url: '/api/app/patient-payment-method',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/patient-payment-method/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<PatientPaymentMethodDto>>(
      {
        method: 'GET',
        url: '/api/app/patient-payment-method',
      },
      { apiName: this.apiName, ...config },
    );
}
