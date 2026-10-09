import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DeliveryStatus} from './delivery-status';
import {DeliveryType} from './delivery-type';

/**
 * Pickup or delivery of an order (aggregate root of the Delivery context).
 */
export class Delivery implements BaseEntity {
  constructor(
    public id: number,
    public orderId: number,
    public customerName: string,
    public type: DeliveryType,
    public address: string,
    public driverName: string,
    public scheduledAt: string,
    public status: DeliveryStatus,
    public completedAt: string
  ) {}

  /** Status that follows the current one in the normal flow, or null once the delivery is closed. */
  nextStatus(): DeliveryStatus | null {
    switch (this.status) {
      case DeliveryStatus.SCHEDULED: return DeliveryStatus.ON_THE_WAY;
      case DeliveryStatus.ON_THE_WAY: return DeliveryStatus.COMPLETED;
      default: return null;
    }
  }

  /** Whether the delivery can no longer change (completed or failed). */
  isClosed(): boolean {
    return this.status === DeliveryStatus.COMPLETED || this.status === DeliveryStatus.FAILED;
  }
}
