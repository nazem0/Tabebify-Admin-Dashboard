import type { PagedResultRequestDto } from '@abp/ng.core';

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface GetProviderReviewsInput extends PagedResultRequestDto {
  providerId?: string;
}

export interface ProviderRatingDto {
  averageRating?: number;
  totalReviews?: number;
  reviews?: ReviewDto[];
}

export interface ReviewDto {
  id?: string;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
}
