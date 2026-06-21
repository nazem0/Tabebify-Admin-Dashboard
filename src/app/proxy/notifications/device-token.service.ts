import type { RegisterTokenDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceTokenService {
  private restService = inject(RestService);
  apiName = 'Default';

  registerToken = (input: RegisterTokenDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/device-token/register-token',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  unregisterToken = (token: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/device-token/unregister-token',
        params: { token },
      },
      { apiName: this.apiName, ...config },
    );
}
