import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type {
  AuthResultDto,
  RegisterDto,
  ResetPasswordByEmailInputDto,
  ResetPasswordByOtpInputDto,
} from '../../auth/models';
import type {
  ForgotPasswordInputDto,
  ResendOtpInputDto,
  VerifyOtpInputDto,
} from '../../dtos/auth/models';
import type {
  ResetPasswordDto,
  SendPasswordResetCodeDto,
  VerifyPasswordResetTokenInput,
} from '../../volo/abp/account/models';

@Injectable({
  providedIn: 'root',
})
export class TabebifyAccountService {
  private restService = inject(RestService);
  apiName = 'Default';

  confirmResetPasswordByEmail = (
    input: ResetPasswordByEmailInputDto,
    config?: Partial<Rest.Config>,
  ) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/confirm-reset-password-by-email',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  confirmResetPasswordByOtp = (input: ResetPasswordByOtpInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/confirm-reset-password-by-otp',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  register = (input: RegisterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AuthResultDto>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/register',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  resendForgotPasswordOtp = (input: ResendOtpInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/resend-forgot-password-otp',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  resendRegistrationOtp = (input: ResendOtpInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/resend-registration-otp',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  resetPassword = (input: ResetPasswordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/reset-password',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  sendPasswordResetCode = (input: SendPasswordResetCodeDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/send-password-reset-code',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  sendResetPasswordVerification = (input: ForgotPasswordInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/send-reset-password-verification',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  verifyPasswordResetToken = (
    input: VerifyPasswordResetTokenInput,
    config?: Partial<Rest.Config>,
  ) =>
    this.restService.request<any, boolean>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/verify-password-reset-token',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );

  verifyRegistrationOtp = (input: VerifyOtpInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: '/api/app/tabebify-account/verify-registration-otp',
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
