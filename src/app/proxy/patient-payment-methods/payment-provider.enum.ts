import { mapEnumToOptions } from '@abp/ng.core';

export enum PaymentProvider {
  Visa = 0,
  Mastercard = 1,
  Mada = 2,
}

export const paymentProviderOptions = mapEnumToOptions(PaymentProvider);
