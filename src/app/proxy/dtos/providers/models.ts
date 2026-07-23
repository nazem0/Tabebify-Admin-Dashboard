import type { EntityDto } from '@abp/ng.core';
import type { Gender } from '../../profiles/gender.enum';

export interface UpdateProviderProfileDto extends EntityDto<string> {
  fullName?: string;
  gender?: Gender;
  isAvailable?: boolean;
  lastLatitude?: number;
  lastLongitude?: number;
  phoneNumber?: string;
}
