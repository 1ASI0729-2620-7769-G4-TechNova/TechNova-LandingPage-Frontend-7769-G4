import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {PaymentMethod} from './payment-method';
import {PaymentStatus} from './payment-status';

/**
 * Payment registered for an order (aggregate root of the Billing context).
 */
export class Payment implements BaseEntity {
  constructor(
    public id: number,
    public orderId: number,
    public customerName: string,
    public amount: number,
    public paymentMethod: PaymentMethod,
    public status: PaymentStatus,
    public reference: string,
    public paidAt: string
  ) {}
}
