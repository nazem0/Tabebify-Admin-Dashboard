import { mapEnumToOptions } from '@abp/ng.core';

export enum ChatType {
  Appointment = 0,
  Support = 1,
}

export const chatTypeOptions = mapEnumToOptions(ChatType);
