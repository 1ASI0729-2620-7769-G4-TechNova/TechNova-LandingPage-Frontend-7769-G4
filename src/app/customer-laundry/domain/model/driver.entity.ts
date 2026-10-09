import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DriverStatus} from './driver-status';

/**
 * Worker of a laundry in charge of pickups and deliveries.
 * An id of 0 means the driver has not been persisted yet.
 */
export class Driver implements BaseEntity {
  constructor(
    public id: number,
    public fullName: string,
    public phone: string,
    public vehicle: string,
    public status: DriverStatus
  ) {}

  isActive(): boolean {
    return this.status === DriverStatus.ACTIVE;
  }
}
