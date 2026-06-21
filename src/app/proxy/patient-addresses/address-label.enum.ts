import { mapEnumToOptions } from '@abp/ng.core';

export enum AddressLabel {
  Home = 0,
  Work = 1,
  Other = 2,
}

export const addressLabelOptions = mapEnumToOptions(AddressLabel);
