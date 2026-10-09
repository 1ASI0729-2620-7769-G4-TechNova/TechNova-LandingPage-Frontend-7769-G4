import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DeliveryStatus} from './delivery-status';

/**
 * Entry of the tracking history of a delivery: a status reached at a given moment.
 */
export class TrackingEvent implements BaseEntity {
  constructor(
    public id: number,
    public deliveryId: number,
    public status: DeliveryStatus,
    public note: string,
    public occurredAt: string
  ) {}
}
