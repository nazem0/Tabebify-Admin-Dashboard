import type { AuthResultDto, DeleteAccountResultDto, RegisterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private restService = inject(RestService);
  apiName = 'Default';

  deleteMyAccount = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, DeleteAccountResultDto>(
      {
        method: 'DELETE',
        url: '/api/account/me',
      },
      { apiName: this.apiName, ...config },
    );

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
