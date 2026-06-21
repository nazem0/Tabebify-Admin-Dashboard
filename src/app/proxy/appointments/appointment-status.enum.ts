import { mapEnumToOptions } from '@abp/ng.core';

export enum AppointmentStatus {
  PendingPayment = 0,
  SearchingProvider = 1,
  Accepted = 2,
  EnRoute = 3,
  Completed = 4,
  Reviewed = 5,
  CancelledByPatient = 6,
  CancelledByProvider = 7,
  CancelledNoProvider = 8,
}

export const appointmentStatusOptions = mapEnumToOptions(AppointmentStatus);
