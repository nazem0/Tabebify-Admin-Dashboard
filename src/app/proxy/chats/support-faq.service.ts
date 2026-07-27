import type { CreateSupportFaqDto, SupportFaqDto, UpdateSupportFaqDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SupportFaqService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (input: CreateSupportFaqDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SupportFaqDto>(
      {
        method: 'POST',
        url: '/api/app/support-faq',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/support-faq/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SupportFaqDto>(
      {
        method: 'GET',
        url: `/api/app/support-faq/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<SupportFaqDto>>(
      {
        method: 'GET',
        url: '/api/app/support-faq',
      },
      { apiName: this.apiName, ...config },
    );

  update = (id: string, input: UpdateSupportFaqDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SupportFaqDto>(
      {
        method: 'PUT',
        url: `/api/app/support-faq/${id}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
