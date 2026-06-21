import type { ItemDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { CreateUpdateItemDto } from '../dtos/services/models';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (input: CreateUpdateItemDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ItemDto>(
      {
        method: 'POST',
        url: '/api/app/item',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ItemDto>>(
      {
        method: 'GET',
        url: '/api/app/item',
      },
      { apiName: this.apiName, ...config },
    );

  update = (id: string, input: CreateUpdateItemDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ItemDto>(
      {
        method: 'PUT',
        url: `/api/app/item/${id}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
