import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Delivery as exchanged with the API.
 */
export interface DeliveryResource extends BaseResource {
  orderId: number;
  customerName: string;
  type: string;
  address: string;
  driverName: string;
  scheduledAt: string;
  status: string;
  completedAt: string;
}

/**
 * Response envelope for delivery collections.
 */
export interface DeliveriesResponse extends BaseResponse {
  deliveries: DeliveryResource[];
}
