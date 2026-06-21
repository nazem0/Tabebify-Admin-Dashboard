import type { NotificationType } from './notification-type.enum';

export interface NotificationDto {
  id?: string;
  title?: string;
  body?: string;
  type?: NotificationType;
  referenceType?: string;
  referenceId?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface RegisterTokenDto {
  token: string;
  platform?: string;
}
