import type { PaymentProvider } from '../patient-payment-methods/payment-provider.enum';
import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { PaymentStatus } from './payment-status.enum';
import type { WalletTransactionType } from './wallet-transaction-type.enum';

export interface CreatePatientPaymentMethodDto {
  token: string;
  provider: PaymentProvider;
  cardBrand?: string;
  last4Digits?: string;
  expiryMonth?: number;
  expiryYear?: number;
  saveForLater?: boolean;
}

export interface GetWalletTransactionsInput extends PagedAndSortedResultRequestDto {}

export interface InitiatePaymentDto {
  appointmentId: string;
  savedPaymentMethodId?: string;
  newCardToken?: string;
}

export interface InitiatePaymentResultDto {
  paymentId?: string;
  status?: PaymentStatus;
  gatewayRedirectUrl?: string;
}

export interface PatientPaymentMethodDto {
  id?: string;
  provider?: string;
  cardBrand?: string;
  last4Digits?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface PaymentWebhookDto {
  gatewayTransactionId?: string;
  status?: PaymentStatus;
  transactionRef?: string;
  signature?: string;
}

export interface ProviderWalletDto {
  currentBalance?: number;
  totalEarned?: number;
  thisMonthEarnings?: number;
  lastMonthEarnings?: number;
}

export interface WalletTransactionDto {
  id?: string;
  type?: WalletTransactionType;
  amount?: number;
  date?: string;
  appointmentId?: string;
  description?: string;
}

export interface WithdrawRequestDto {
  amount: number;
}
