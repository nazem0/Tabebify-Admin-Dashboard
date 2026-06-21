import type { AddressLabel } from '../patient-addresses/address-label.enum';
import type { EntityDto } from '@abp/ng.core';
import type { Gender } from '../profiles/gender.enum';

export interface CreatePatientAddressDto {
  label: AddressLabel;
  address: string;
  latitude?: number;
  longitude?: number;
  setAsDefault?: boolean;
}

export interface PatientAddressDto extends EntityDto<string> {
  label?: AddressLabel;
  address?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface PatientProfileDto extends EntityDto<string> {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  photoUrl?: string;
  medicalNotes?: string;
}

export interface UpdatePatientProfileDto {
  fullName: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  photoUrl?: string;
  medicalNotes?: string;
}
