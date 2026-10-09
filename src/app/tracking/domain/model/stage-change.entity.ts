import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {OrderStage} from './order-stage';

/**
 * Record of an order reaching a stage; keeps the date and time of the change.
 */
export class StageChange implements BaseEntity {
  constructor(
    public id: number,
    public orderId: number,
    public stage: OrderStage,
    public changedAt: string
  ) {}
}
