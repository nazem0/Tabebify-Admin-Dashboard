import { mapEnumToOptions } from '@abp/ng.core';

export enum VerificationAction {
  Approve = 0,
  Reject = 1,
  RequestDocuments = 2,
}

export const verificationActionOptions = mapEnumToOptions(VerificationAction);
