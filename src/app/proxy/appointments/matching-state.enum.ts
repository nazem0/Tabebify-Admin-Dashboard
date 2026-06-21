import { mapEnumToOptions } from '@abp/ng.core';

export enum MatchingState {
  Searching = 0,
  Found = 1,
  Failed = 2,
}

export const matchingStateOptions = mapEnumToOptions(MatchingState);
