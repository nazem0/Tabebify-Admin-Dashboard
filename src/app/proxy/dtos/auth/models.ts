export interface ForgotPasswordInputDto {
  loginProvider: string;
}

export interface ResendOtpInputDto {
  phoneNumber: string;
}

export interface VerifyOtpInputDto {
  phoneNumber: string;
  otpCode: string;
}
