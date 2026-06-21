import type { AdminPatientListDto } from '../../../../proxy/dtos/patients';

/** Re-export the base DTO — all fields now come from the backend directly. */
export type UserDisplayDto = AdminPatientListDto;

export interface UserBookingItem {
  id: string;
  specialty: string;
  doctor: string;
  scheduledAt: string;
  status: 'completed' | 'upcoming' | 'cancelled';
}

export interface UserPaymentItem {
  invoiceId: string;
  method: 'visa' | 'wallet' | 'cash';
  amount: number;
}

/** Shape of the reactive form used inside the edit modal. */
export interface UserEditForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
}
