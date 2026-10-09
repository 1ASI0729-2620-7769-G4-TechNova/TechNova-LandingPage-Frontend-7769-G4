import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Notification as exchanged with the API.
 */
export interface NotificationResource extends BaseResource {
  recipientId: number;
  orderId: number;
  orderNumber: string;
  stage: string;
  createdAt: string;
  read: boolean;
}

/**
 * Response envelope for notification collections.
 */
export interface NotificationsResponse extends BaseResponse {
  notifications: NotificationResource[];
}
