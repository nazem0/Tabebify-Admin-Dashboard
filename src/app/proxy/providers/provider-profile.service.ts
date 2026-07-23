import type { ProviderProfileDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { UpdateProviderProfileDto } from '../dtos/providers/models';

@Injectable({
  providedIn: 'root',
})
export class ProviderProfileService {
  private restService = inject(RestService);
  apiName = 'Default';

  get = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderProfileDto>(
      {
        method: 'GET',
        url: '/api/app/provider-profile',
      },
      { apiName: this.apiName, ...config },
    );

  update = (input: UpdateProviderProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderProfileDto>(
      {
        method: 'PUT',
        url: '/api/app/provider-profile',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
