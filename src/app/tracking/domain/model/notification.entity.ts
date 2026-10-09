import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {OrderStage} from './order-stage';

/**
 * Notice sent to a customer when their order reaches a new stage.
 */
export class Notification implements BaseEntity {
  constructor(
    public id: number,
    public recipientId: number,
    public orderId: number,
    public orderNumber: string,
    public stage: OrderStage,
    public createdAt: string,
    public read: boolean
  ) {}
}
