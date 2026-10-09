import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Laundry order as exchanged with the API.
 */
export interface LaundryOrderResource extends BaseResource {
  orderId: number;
  orderNumber: string;
  customerId: number;
  garmentCount: number;
  status: string;
  receivedAt: string;
  updatedAt: string;
}

/**
 * Response envelope for laundry order collections.
 */
export interface LaundryOrdersResponse extends BaseResponse {
  laundryOrders: LaundryOrderResource[];
}

/**
 * Part of an order (owned by Order Management) that this context reads when receiving it.
 */
export interface ConfirmedOrderResource extends BaseResource {
  orderNumber: string;
  customerId: number;
  createdAt: string;
  garments: { quantity: number }[];
}
