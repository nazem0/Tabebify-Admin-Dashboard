import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface AdminPatientFilterInput extends PagedAndSortedResultRequestDto {
  filter?: string;
}

export interface AdminPatientListDto extends EntityDto<string> {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt?: string;
  isActive?: boolean;
  bookingCount?: number;
  totalPayments?: number;
  lastLoginTime?: string;
  isEmailConfirmed?: boolean;
}
