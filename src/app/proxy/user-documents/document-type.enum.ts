import { mapEnumToOptions } from '@abp/ng.core';

export enum DocumentType {
  NationalId = 0,
  License = 1,
  Certificate = 2,
}

export const documentTypeOptions = mapEnumToOptions(DocumentType);
