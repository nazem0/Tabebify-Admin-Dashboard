import type { VerificationAction } from './verification-action.enum';
import type { Gender } from '../profiles/gender.enum';

export interface AuthResultDto {
  userId?: string;
  email?: string;
  userName?: string;
  role?: string;
}

export interface ProviderVerificationDto {
  providerId: string;
  action: VerificationAction;
  reason?: string;
}

export interface RegisterDto {
  userName?: string;
  emailAddress?: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  dateOfBirth?: string;
  gender?: Gender;
  medicalNotes?: string;
}

export interface ResetPasswordByEmailInputDto {
  userId: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordByOtpInputDto {
  phoneNumber: string;
  otpCode: string;
  newPassword: string;
}
