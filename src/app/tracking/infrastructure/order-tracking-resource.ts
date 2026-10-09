import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Order tracking as exchanged with the API.
 */
export interface OrderTrackingResource extends BaseResource {
  orderId: number;
  orderNumber: string;
  customerId: number;
  stage: string;
  updatedAt: string;
}

/**
 * Response envelope for order tracking collections.
 */
export interface OrderTrackingsResponse extends BaseResponse {
  orderTrackings: OrderTrackingResource[];
}
