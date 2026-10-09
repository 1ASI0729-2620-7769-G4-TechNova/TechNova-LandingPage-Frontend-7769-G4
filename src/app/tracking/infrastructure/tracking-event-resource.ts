import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Tracking event as exchanged with the API.
 */
export interface TrackingEventResource extends BaseResource {
  deliveryId: number;
  status: string;
  note: string;
  occurredAt: string;
}

/**
 * Response envelope for tracking event collections.
 */
export interface TrackingEventsResponse extends BaseResponse {
  trackingEvents: TrackingEventResource[];
}
