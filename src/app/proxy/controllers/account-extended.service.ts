import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { IActionResult } from '../microsoft/asp-net-core/mvc/models';

@Injectable({
  providedIn: 'root',
})
export class AccountExtendedService {
  private restService = inject(RestService);
  apiName = 'Default';

  getSessionStatus = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>(
      {
        method: 'GET',
        url: '/api/account/session-status',
      },
      { apiName: this.apiName, ...config },
    );

  logoutMobile = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>(
      {
        method: 'POST',
        url: '/api/account/logout-mobile',
      },
      { apiName: this.apiName, ...config },
    );
}
