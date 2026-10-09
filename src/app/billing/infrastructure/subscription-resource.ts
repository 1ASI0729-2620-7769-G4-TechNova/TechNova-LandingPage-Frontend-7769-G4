import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Subscription as exchanged with the API.
 */
export interface SubscriptionResource extends BaseResource {
  laundryId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
}

/**
 * Response envelope for subscription collections.
 */
export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
