import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Item of an order as exchanged with the API. The garment type and color travel inside the notes
 * (`type|color|notes`) because the API only accepts a fixed set of garment categories.
 */
export interface OrderItemResource {
  id?: number;
  serviceId: number;
  garmentType: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

/**
 * Order as exchanged with the API. The delivery method travels in the special instructions.
 */
export interface OrderResource extends BaseResource {
  orderNumber?: string;
  customerId: number;
  laundryId?: number;
  status?: string;
  promisedDate?: string;
  totalAmount?: number;
  currency?: string;
  specialInstructions?: string;
  createdAt?: string;
  items: OrderItemResource[];
}

/**
 * Response envelope for order collections.
 */
export interface OrdersResponse extends BaseResponse {
  orders: OrderResource[];
}
