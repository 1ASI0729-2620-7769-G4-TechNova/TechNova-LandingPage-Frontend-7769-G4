import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * User account as exchanged with the API.
 */
export interface UserAccountResource extends BaseResource {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  status: string;
  accountType?: string;
  businessName?: string;
}

/**
 * Response envelope for user collections.
 */
export interface UserAccountsResponse extends BaseResponse {
  users: UserAccountResource[];
}

/**
 * Payload used to register a new account.
 */
export interface SignUpResource {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: string;
  businessName?: string;
}
