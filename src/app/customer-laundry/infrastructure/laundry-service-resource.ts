import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Laundry service as exchanged with the API.
 */
export interface LaundryServiceResource extends BaseResource {
  name: string;
  description: string;
  unit: string;
  price: number;
  active: boolean;
}

/**
 * Response envelope for laundry service collections.
 */
export interface LaundryServicesResponse extends BaseResponse {
  laundryServices: LaundryServiceResource[];
}
