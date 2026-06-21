import type {
  CreateServiceDto,
  GetServicesInput,
  ItemDto,
  ServiceDetailDto,
  ServiceDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { AddServiceItemDto } from '../dtos/services/models';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private restService = inject(RestService);
  apiName = 'Default';

  addItemToService = (serviceId: string, input: AddServiceItemDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/service/item-to-service/${serviceId}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  create = (input: CreateServiceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceDto>(
      {
        method: 'POST',
        url: '/api/app/service',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/service/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceDetailDto>(
      {
        method: 'GET',
        url: `/api/app/service/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getItems = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ItemDto>>(
      {
        method: 'GET',
        url: `/api/app/service/${id}/items`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (input: GetServicesInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ServiceDto>>(
      {
        method: 'GET',
        url: '/api/app/service',
        params: {
          categoryId: input.categoryId,
          filter: input.filter,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  removeItemFromService = (serviceId: string, itemId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: '/api/app/service/item-from-service',
        params: { serviceId, itemId },
      },
      { apiName: this.apiName, ...config },
    );

  update = (id: string, input: CreateServiceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceDto>(
      {
        method: 'PUT',
        url: `/api/app/service/${id}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
