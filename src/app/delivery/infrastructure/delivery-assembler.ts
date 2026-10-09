import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {DeliveryType} from '../domain/model/delivery-type';
import {DeliveriesResponse, DeliveryResource} from './delivery-resource';

/**
 * Converts between {@link Delivery} and its API representation.
 */
export class DeliveryAssembler implements BaseAssembler<Delivery, DeliveryResource, DeliveriesResponse> {

  toEntityFromResource(resource: DeliveryResource): Delivery {
    return new Delivery(
      resource.id,
      resource.orderId,
      resource.customerName,
      resource.type as DeliveryType,
      resource.address,
      resource.driverName,
      resource.scheduledAt,
      resource.status as DeliveryStatus,
      resource.completedAt
    );
  }

  toResourceFromEntity(entity: Delivery): DeliveryResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      customerName: entity.customerName,
      type: entity.type,
      address: entity.address,
      driverName: entity.driverName,
      scheduledAt: entity.scheduledAt,
      status: entity.status,
      completedAt: entity.completedAt
    };
  }

  toEntitiesFromResponse(response: DeliveriesResponse): Delivery[] {
    return response.deliveries.map(resource => this.toEntityFromResource(resource));
  }
}
