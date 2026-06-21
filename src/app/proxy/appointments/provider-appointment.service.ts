import type {
  AppointmentDetailDto,
  AppointmentSummaryDto,
  AvailableJobDto,
  GetAppointmentsInput,
  UpdateProviderLocationDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProviderAppointmentService {
  private restService = inject(RestService);
  apiName = 'Default';

  accept = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AppointmentDetailDto>(
      {
        method: 'POST',
        url: `/api/app/provider-appointment/${id}/accept`,
      },
      { apiName: this.apiName, ...config },
    );

  cancel = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/provider-appointment/${id}/cancel`,
      },
      { apiName: this.apiName, ...config },
    );

  complete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/provider-appointment/${id}/complete`,
      },
      { apiName: this.apiName, ...config },
    );

  getAvailableJobs = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<AvailableJobDto>>(
      {
        method: 'GET',
        url: '/api/app/provider-appointment/available-jobs',
      },
      { apiName: this.apiName, ...config },
    );

  getList = (input: GetAppointmentsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AppointmentSummaryDto>>(
      {
        method: 'GET',
        url: '/api/app/provider-appointment',
        params: {
          isActive: input.isActive,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  setAvailability = (isAvailable: boolean, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/provider-appointment/set-availability',
        params: { isAvailable },
      },
      { apiName: this.apiName, ...config },
    );

  startMoving = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/provider-appointment/${id}/start-moving`,
      },
      { apiName: this.apiName, ...config },
    );

  updateLocation = (input: UpdateProviderLocationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'PUT',
        url: '/api/app/provider-appointment/location',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
