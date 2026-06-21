import type { CreatePatientAddressDto, PatientAddressDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PatientAddressService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (input: CreatePatientAddressDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PatientAddressDto>(
      {
        method: 'POST',
        url: '/api/app/patient-address',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/patient-address/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<PatientAddressDto>>(
      {
        method: 'GET',
        url: '/api/app/patient-address',
      },
      { apiName: this.apiName, ...config },
    );

  setDefault = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/patient-address/${id}/set-default`,
      },
      { apiName: this.apiName, ...config },
    );
}
