import type { EntityDto, PagedResultRequestDto } from '@abp/ng.core';
import type { AppointmentStatus } from './appointment-status.enum';
import type { ArrivalStatus } from './arrival-status.enum';
import type { PaymentMethod } from '../payments/payment-method.enum';
import type { MatchingState } from './matching-state.enum';

export interface AddServiceDto {
  serviceId: string;
  selectedItems?: SelectedItemDto[];
}

export interface AppointmentDetailDto extends AppointmentDto {
  items?: AppointmentItemDto[];
  assignedProvider?: AppointmentProviderDto;
  street?: string;
  area?: string;
  building?: string;
  apartmentNumber?: string;
  closestLandmark?: string;
  addressLatitude?: number;
  addressLongitude?: number;
  servicePrice?: number;
  itemsTotal?: number;
  grandTotal?: number;
  canCancel?: boolean;
}

export interface AppointmentDto extends EntityDto<string> {
  visitNumber?: string;
  status?: AppointmentStatus;
  statusLabel?: string;
  serviceName?: string;
  serviceIconUrl?: string;
  totalAmount?: number;
  addressLabel?: string;
  addressSummary?: string;
  createdAt?: string;
  scheduledAt?: string;
}

export interface AppointmentItemDto extends EntityDto<string> {
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface AppointmentProviderDto {
  providerId?: string;
  fullName?: string;
  photoUrl?: string;
  title?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  phoneNumber?: string;
}

export interface AppointmentSummaryDto extends EntityDto<string> {
  visitNumber?: string;
  status?: AppointmentStatus;
  statusLabel?: string;
  serviceName?: string;
  serviceIconUrl?: string;
  totalAmount?: number;
  addressLabel?: string;
  createdAt?: string;
  assignedProviderName?: string;
  assignedProviderPhoto?: string;
}

export interface ArrivalEstimateDto {
  estimatedMinutes?: number;
  status?: ArrivalStatus;
  statusLabel?: string;
  providerLatitude?: number;
  providerLongitude?: number;
}

export interface AvailableJobDto extends EntityDto<string> {
  serviceName?: string;
  serviceIconUrl?: string;
  patientArea?: string;
  distanceKm?: number;
  estimatedTravelMinutes?: number;
  durationMinutes?: number;
  nurseEarnings?: number;
  itemNames?: string[];
  requestedAt?: string;
}

export interface CreateAppointmentDto {
  serviceId: string;
  addressId: string;
  selectedItems?: SelectedItemDto[];
  notes?: string;
  paymentMethod: PaymentMethod;
  savedPaymentMethodId?: string;
}

export interface GetAppointmentsInput extends PagedResultRequestDto {
  isActive?: boolean;
}

export interface MatchingStatusDto {
  state?: MatchingState;
  searchRadiusKm?: number;
  activeNearbyCount?: number;
  assignedProviderId?: string;
  assignedProviderName?: string;
}

export interface ScheduleAppointmentDto {
  serviceId: string;
  addressId: string;
  scheduledAt: string;
  selectedItems?: SelectedItemDto[];
  notes?: string;
  paymentMethod?: PaymentMethod;
  savedPaymentMethodId?: string;
}

export interface ScheduledAppointmentDto {
  appointmentId?: string;
  visitNumber?: string;
  scheduledAt?: string;
  status?: string;
  serviceName?: string;
  totalAmount?: number;
}

export interface SelectedItemDto {
  itemId: string;
  quantity?: number;
}

export interface UpdateProviderLocationDto {
  latitude: number;
  longitude: number;
}
