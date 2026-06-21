import { mapEnumToOptions } from '@abp/ng.core';

export enum WalletTransactionType {
  Debit = 0,
  Credit = 1,
  Withdrawal = 2,
}

export const walletTransactionTypeOptions = mapEnumToOptions(WalletTransactionType);
