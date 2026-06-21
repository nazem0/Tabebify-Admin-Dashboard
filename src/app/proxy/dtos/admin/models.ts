import type { IdentityUserCreateDto } from '../../volo/abp/identity/models';
import type { Gender } from '../../profiles/gender.enum';
import type { EntityDto } from '@abp/ng.core';

export interface RegisterPatientDto extends IdentityUserCreateDto {
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
}

export interface UserDisplayDto extends EntityDto<string> {
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  bookingCount?: number;
  totalPayments?: number;
}
