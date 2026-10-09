import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {ORDER_STAGES, OrderStage} from './order-stage';

/**
 * Stage in which an order currently is (aggregate root of the Tracking context).
 * It keeps its own copy of the order number and customer so it does not depend on Order Management.
 */
export class OrderTracking implements BaseEntity {
  constructor(
    public id: number,
    public orderId: number,
    public orderNumber: string,
    public customerId: number,
    public stage: OrderStage,
    public updatedAt: string
  ) {}

  /** Stage that follows the current one, or null once the order has been delivered. */
  nextStage(): OrderStage | null {
    return ORDER_STAGES[ORDER_STAGES.indexOf(this.stage) + 1] ?? null;
  }

  /** Position of the current stage (0 = received). */
  stageIndex(): number {
    return ORDER_STAGES.indexOf(this.stage);
  }
}
