import type {
  CreateReviewDto,
  GetProviderReviewsInput,
  ProviderRatingDto,
  ReviewDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private restService = inject(RestService);
  apiName = 'Default';

  create = (appointmentId: string, input: CreateReviewDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ReviewDto>(
      {
        method: 'POST',
        url: '/api/app/review',
        params: { appointmentId },
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  getProviderReviews = (input: GetProviderReviewsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderRatingDto>(
      {
        method: 'GET',
        url: '/api/app/review/provider-reviews',
        params: {
          providerId: input.providerId,
          skipCount: input.skipCount,
          maxResultCount: input.maxResultCount,
        },
      },
      { apiName: this.apiName, ...config },
    );
}
