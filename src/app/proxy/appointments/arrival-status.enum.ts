import { mapEnumToOptions } from '@abp/ng.core';

export enum ArrivalStatus {
  OnTime = 0,
  Delayed = 1,
}

export const arrivalStatusOptions = mapEnumToOptions(ArrivalStatus);
