import { mapEnumToOptions } from '@abp/ng.core';

export enum ProviderAccountStatus {
  PendingDocuments = 0,
  PendingReview = 1,
  Approved = 2,
  Rejected = 3,
  Suspended = 4,
  UnverifiedPhone = 5,
}

export const providerAccountStatusOptions = mapEnumToOptions(ProviderAccountStatus);
