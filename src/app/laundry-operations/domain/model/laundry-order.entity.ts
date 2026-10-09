import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {LAUNDRY_FLOW, LaundryStatus} from './laundry-status';

/**
 * Processing of an order inside the laundry (aggregate root of the Laundry Operations context).
 * It keeps its own copy of the order number and customer so it does not depend on Order Management.
 */
export class LaundryOrder implements BaseEntity {
  constructor(
    public id: number,
    public orderId: number,
    public orderNumber: string,
    public customerId: number,
    public garmentCount: number,
    public status: LaundryStatus,
    public receivedAt: string,
    public updatedAt: string
  ) {}

  /** Status that follows the current one, or null once the garments are ready for delivery. */
  nextStatus(): LaundryStatus | null {
    return LAUNDRY_FLOW[LAUNDRY_FLOW.indexOf(this.status) + 1] ?? null;
  }

  isReady(): boolean {
    return this.status === LaundryStatus.READY_FOR_DELIVERY;
  }
}
