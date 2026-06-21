import type {
  AddServiceDto,
  AppointmentDetailDto,
  AppointmentSummaryDto,
  ArrivalEstimateDto,
  CreateAppointmentDto,
  GetAppointmentsInput,
  MatchingStatusDto,
  ScheduleAppointmentDto,
  ScheduledAppointmentDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private restService = inject(RestService);
  apiName = 'Default';

  addService = (id: string, input: AddServiceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AppointmentDetailDto>(
      {
        method: 'POST',
        url: `/api/app/appointment/${id}/service`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  cancel = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/appointment/${id}/cancel`,
      },
      { apiName: this.apiName, ...config },
    );

  create = (input: CreateAppointmentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AppointmentDetailDto>(
      {
        method: 'POST',
        url: '/api/app/appointment',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  expandSearch = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/api/app/appointment/${id}/expand-search`,
      },
      { apiName: this.apiName, ...config },
    );

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AppointmentDetailDto>(
      {
        method: 'GET',
        url: `/api/app/appointment/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getArrivalEstimate = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ArrivalEstimateDto>(
      {
        method: 'GET',
        url: `/api/app/appointment/${id}/arrival-estimate`,
      },
      { apiName: this.apiName, ...config },
    );

  getList = (input: GetAppointmentsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AppointmentSummaryDto>>(
      {
        method: 'GET',
        url: '/api/app/appointment',
        params: {
          isActive: input.isActive,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  getMatchingStatus = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MatchingStatusDto>(
      {
        method: 'GET',
        url: `/api/app/appointment/${id}/matching-status`,
      },
      { apiName: this.apiName, ...config },
    );

  schedule = (input: ScheduleAppointmentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ScheduledAppointmentDto>(
      {
        method: 'POST',
        url: '/api/app/appointment/schedule',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
