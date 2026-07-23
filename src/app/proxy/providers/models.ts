import type { EntityDto } from '@abp/ng.core';
import type { Gender } from '../profiles/gender.enum';

export interface ProviderProfileDto extends EntityDto<string> {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  isAvailable?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdatedAt?: string;
}

export interface ProviderStatsDto {
  thisMonthEarnings?: number;
  lastMonthEarnings?: number;
  earningsChangePercent?: number;
  totalVisits?: number;
  averageRating?: number;
  ratingCount?: number;
  completionRate?: number;
}
