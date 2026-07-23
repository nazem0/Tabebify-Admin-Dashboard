import type { AnalyticsPeriod } from './analytics-period.enum';
import type {
  AdminAnalyticsDto,
  AdminDocumentDto,
  AdminPatientUpdateDto,
  AdminProviderFilterInput,
  AdminProviderListDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { RegisterPatientDto, UserDisplayDto } from '../dtos/admin/models';
import type { AdminPatientFilterInput, AdminPatientListDto } from '../dtos/patients/models';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private restService = inject(RestService);
  apiName = 'Default';

  deletePatient = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/admin/patients/${id}`,
      },
      { apiName: this.apiName, ...config },
    );

  getAnalytics = (period: AnalyticsPeriod, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdminAnalyticsDto>(
      {
        method: 'GET',
        url: '/api/app/admin-dashboard/analytics',
        params: { period },
      },
      { apiName: this.apiName, ...config },
    );

  getPatients = (input: AdminPatientFilterInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AdminPatientListDto>>(
      {
        method: 'GET',
        url: '/api/app/admin-dashboard/patients',
        params: {
          filter: input.filter,
          sorting: input.sorting,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  getProviderDocuments = (providerId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<AdminDocumentDto>>(
      {
        method: 'GET',
        url: `/api/app/admin-dashboard/provider-documents/${providerId}`,
      },
      { apiName: this.apiName, ...config },
    );

  getProviders = (input: AdminProviderFilterInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AdminProviderListDto>>(
      {
        method: 'GET',
        url: '/api/app/admin-dashboard/providers',
        params: {
          accountStatus: input.accountStatus,
          filter: input.filter,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );

  registerPatient = (input: RegisterPatientDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDisplayDto>(
      {
        method: 'POST',
        url: '/api/admin/patients/register',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  updatePatient = (id: string, input: AdminPatientUpdateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'PUT',
        url: `/api/admin/patients/${id}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
