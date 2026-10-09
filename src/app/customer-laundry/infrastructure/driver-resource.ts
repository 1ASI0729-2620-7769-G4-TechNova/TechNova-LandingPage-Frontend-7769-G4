import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Driver as exchanged with the API.
 */
export interface DriverResource extends BaseResource {
  fullName: string;
  phone: string;
  vehicle: string;
  status: string;
}

/**
 * Response envelope for driver collections.
 */
export interface DriversResponse extends BaseResponse {
  drivers: DriverResource[];
}
