import { mapEnumToOptions } from '@abp/ng.core';

export enum AnalyticsPeriod {
  Week = 0,
  Month = 1,
  Year = 2,
}

export const analyticsPeriodOptions = mapEnumToOptions(AnalyticsPeriod);
