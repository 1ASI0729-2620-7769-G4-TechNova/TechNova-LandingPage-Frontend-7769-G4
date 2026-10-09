import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Payment as exchanged with the API.
 */
export interface PaymentResource extends BaseResource {
  orderId: number;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  reference: string;
  paidAt: string;
}

/**
 * Response envelope for payment collections.
 */
export interface PaymentsResponse extends BaseResponse {
  payments: PaymentResource[];
}
