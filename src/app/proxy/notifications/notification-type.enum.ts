import { mapEnumToOptions } from '@abp/ng.core';

export enum NotificationType {
  AppointmentStatusChanged = 0,
  NewJobAvailable = 1,
  NoProviderFound = 2,
  ChatMessage = 3,
  ReviewReceived = 4,
  SystemAnnouncement = 5,
}

export const notificationTypeOptions = mapEnumToOptions(NotificationType);
