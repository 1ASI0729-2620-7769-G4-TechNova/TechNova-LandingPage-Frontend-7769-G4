import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {ServiceUnit} from './service-unit';

/**
 * Service offered by a laundry and its price (aggregate root of the Customer & Laundry context).
 * An id of 0 means the service has not been persisted yet.
 */
export class LaundryService implements BaseEntity {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public unit: ServiceUnit,
    public price: number,
    public active: boolean
  ) {}
}
