export interface AddServiceItemDto {
  serviceId: string;
  itemId: string;
  quantity: number;
}

export interface CreateUpdateItemDto {
  name: string;
  defaultPrice: number;
  isActive?: boolean;
}
