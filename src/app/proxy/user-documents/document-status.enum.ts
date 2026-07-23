import { mapEnumToOptions } from '@abp/ng.core';

export enum DocumentStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  AdditionalRequested = 3,
}

export const documentStatusOptions = mapEnumToOptions(DocumentStatus);
