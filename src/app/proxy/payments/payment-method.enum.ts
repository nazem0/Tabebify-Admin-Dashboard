import { mapEnumToOptions } from '@abp/ng.core';

export enum PaymentMethod {
  Card = 0,
  Cash = 1,
  Wallet = 2,
  Digital = 3,
}

export const paymentMethodOptions = mapEnumToOptions(PaymentMethod);
