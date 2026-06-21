import type { EntityDto, PagedResultRequestDto } from '@abp/ng.core';

export interface CreateServiceCategoryDto {
  name: string;
  iconUrl?: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  iconUrl?: string;
  categoryId: string;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
  itemIds?: string[];
}

export interface GetServicesInput extends PagedResultRequestDto {
  categoryId?: string;
  filter?: string;
}

export interface ItemDto extends EntityDto<string> {
  name?: string;
  price?: number;
  iconUrl?: string;
  defaultQuantity?: number;
  isActive?: boolean;
}

export interface ServiceCategoryDto extends EntityDto<string> {
  name?: string;
  iconUrl?: string;
  serviceCount?: number;
}

export interface ServiceDetailDto extends ServiceDto {
  availableItems?: ItemDto[];
}

export interface ServiceDto extends EntityDto<string> {
  name?: string;
  description?: string;
  iconUrl?: string;
  durationMinutes?: number;
  durationLabel?: string;
  price?: number;
  isVerified?: boolean;
  categoryId?: string;
  categoryName?: string;
}

export interface UpdateServiceCategoryDto extends CreateServiceCategoryDto {}
