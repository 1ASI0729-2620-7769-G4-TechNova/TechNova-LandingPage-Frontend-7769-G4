import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Plan as exchanged with the API.
 */
export interface PlanResource extends BaseResource {
  name: string;
  price: number;
  currency: string;
  features: string[];
}

/**
 * Response envelope for plan collections.
 */
export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}
