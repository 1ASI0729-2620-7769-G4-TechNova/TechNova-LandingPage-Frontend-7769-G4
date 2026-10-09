import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {OrderTracking} from '../domain/model/order-tracking.entity';
import {OrderStage} from '../domain/model/order-stage';
import {OrderTrackingResource, OrderTrackingsResponse} from './order-tracking-resource';

/**
 * Converts between {@link OrderTracking} and its API representation.
 */
export class OrderTrackingAssembler
  implements BaseAssembler<OrderTracking, OrderTrackingResource, OrderTrackingsResponse> {

  toEntityFromResource(resource: OrderTrackingResource): OrderTracking {
    return new OrderTracking(
      resource.id,
      resource.orderId,
      resource.orderNumber,
      resource.customerId,
      resource.stage as OrderStage,
      resource.updatedAt
    );
  }

  toResourceFromEntity(entity: OrderTracking): OrderTrackingResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      orderNumber: entity.orderNumber,
      customerId: entity.customerId,
      stage: entity.stage,
      updatedAt: entity.updatedAt
    };
  }

  toEntitiesFromResponse(response: OrderTrackingsResponse): OrderTracking[] {
    return response.orderTrackings.map(resource => this.toEntityFromResource(resource));
  }
}
