import type {
  CreateServiceCategoryDto,
  ServiceCategoryDto,
  UpdateServiceCategoryDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategoryService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (input: CreateServiceCategoryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceCategoryDto>(
      {
        method: 'POST',
        url: '/api/app/service-category',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/service-category/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ServiceCategoryDto>>(
      {
        method: 'GET',
        url: '/api/app/service-category',
      },
      { apiName: this.apiName, ...config },
    );

  update = (id: string, input: UpdateServiceCategoryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceCategoryDto>(
      {
        method: 'PUT',
        url: `/api/app/service-category/${id}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
