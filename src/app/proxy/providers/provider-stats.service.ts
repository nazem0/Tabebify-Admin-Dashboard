import type { ProviderStatsDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProviderStatsService {
  private restService = inject(RestService);
  apiName = 'Default';

  getStats = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderStatsDto>(
      {
        method: 'GET',
        url: '/api/app/provider-stats/stats',
      },
      { apiName: this.apiName, ...config },
    );
}
