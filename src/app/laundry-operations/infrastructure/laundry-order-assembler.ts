import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {LaundryOrder} from '../domain/model/laundry-order.entity';
import {LaundryStatus} from '../domain/model/laundry-status';
import {LaundryOrderResource, LaundryOrdersResponse} from './laundry-order-resource';

/**
 * Converts between {@link LaundryOrder} and its API representation.
 */
export class LaundryOrderAssembler
  implements BaseAssembler<LaundryOrder, LaundryOrderResource, LaundryOrdersResponse> {

  toEntityFromResource(resource: LaundryOrderResource): LaundryOrder {
    return new LaundryOrder(
      resource.id,
      resource.orderId,
      resource.orderNumber,
      resource.customerId,
      resource.garmentCount,
      resource.status as LaundryStatus,
      resource.receivedAt,
      resource.updatedAt
    );
  }

  toResourceFromEntity(entity: LaundryOrder): LaundryOrderResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      orderNumber: entity.orderNumber,
      customerId: entity.customerId,
      garmentCount: entity.garmentCount,
      status: entity.status,
      receivedAt: entity.receivedAt,
      updatedAt: entity.updatedAt
    };
  }

  toEntitiesFromResponse(response: LaundryOrdersResponse): LaundryOrder[] {
    return response.laundryOrders.map(resource => this.toEntityFromResource(resource));
  }
}
