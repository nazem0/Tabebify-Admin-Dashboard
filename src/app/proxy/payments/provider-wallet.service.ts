import type {
  GetWalletTransactionsInput,
  ProviderWalletDto,
  WalletTransactionDto,
  WithdrawRequestDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProviderWalletService {
  private restService = inject(RestService);
  apiName = 'Default';

  get = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderWalletDto>(
      {
        method: 'GET',
        url: '/api/app/provider-wallet',
      },
      { apiName: this.apiName, ...config },
    );

  getTransactions = (input: GetWalletTransactionsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<WalletTransactionDto>>(
      {
        method: 'GET',
        url: '/api/app/provider-wallet/transactions',
        params: {
          sorting: input.sorting,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  withdraw = (input: WithdrawRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/provider-wallet/withdraw',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
