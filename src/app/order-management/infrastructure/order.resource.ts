import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents a garment as exchanged with the API, embedded inside its order.
 * The order identifier is not repeated because the parent order already defines it.
 */
export interface GarmentResource {
  id: number;
  type: string;
  color: string;
  notes: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Represents an order as exchanged with the API.
 */
export interface OrderResource extends BaseResource {
  orderNumber: string;
  customerId: number;
  deliveryMethod: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  garments: GarmentResource[];
}

/**
 * Represents the response envelope for order collections.
 */
export interface OrdersResponse extends BaseResponse {
  orders: OrderResource[];
}
