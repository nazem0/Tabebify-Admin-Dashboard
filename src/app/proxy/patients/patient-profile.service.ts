import type { PatientProfileDto, UpdatePatientProfileDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PatientProfileService {
  private restService = inject(RestService);
  apiName = 'Default';

  get = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, PatientProfileDto>(
      {
        method: 'GET',
        url: '/api/app/patient-profile',
      },
      { apiName: this.apiName, ...config },
    );

  update = (input: UpdatePatientProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PatientProfileDto>(
      {
        method: 'PUT',
        url: '/api/app/patient-profile',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
