import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Driver as exchanged with the API.
 */
export interface DriverResource extends BaseResource {
  name: string;
  phone: string;
  vehicle: string;
  available: boolean;
}

/**
 * Response envelope for driver collections.
 */
export interface DriversResponse extends BaseResponse {
  drivers: DriverResource[];
}
