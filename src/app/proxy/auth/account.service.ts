import type { AuthResultDto, RegisterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private restService = inject(RestService);
  apiName = 'Default';

  register = (input: RegisterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AuthResultDto>(
      {
        method: 'POST',
        url: '/api/app/account/register',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
