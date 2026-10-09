import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DeliveryMethod} from '../domain/model/delivery-method';
import {Garment} from '../domain/model/garment.entity';
import {Order} from '../domain/model/order.entity';
import {OrderStatus} from '../domain/model/order-status';
import {GarmentResource, OrderResource, OrdersResponse} from './order.resource';

/**
 * Maps order entities (with their garments) to and from API resources.
 */
export class OrderAssembler implements BaseAssembler<Order, OrderResource, OrdersResponse> {

  /**
   * Converts an OrderResource to an Order entity.
   * @param resource - The resource to convert.
   * @returns The converted Order entity, with its garments.
   */
  toEntityFromResource(resource: OrderResource): Order {
    const garmentResources = resource.garments ?? [];
    return new Order({
      id: resource.id,
      orderNumber: resource.orderNumber,
      customerId: resource.customerId,
      deliveryMethod: resource.deliveryMethod as DeliveryMethod,
      status: resource.status as OrderStatus,
      totalAmount: resource.totalAmount,
      createdAt: resource.createdAt,
      garments: garmentResources.map(garmentResource => this.toGarmentFromResource(garmentResource, resource.id))
    });
  }

  /**
   * Converts an Order entity to an OrderResource.
   * @param entity - The entity to convert.
   * @returns The converted OrderResource, with its garments embedded.
   */
  toResourceFromEntity(entity: Order): OrderResource {
    return {
      id: entity.id,
      orderNumber: entity.orderNumber,
      customerId: entity.customerId,
      deliveryMethod: entity.deliveryMethod,
      status: entity.status,
      totalAmount: entity.totalAmount,
      createdAt: entity.createdAt,
      garments: entity.garments.map(garment => this.toResourceFromGarment(garment))
    };
  }

  /**
   * Converts an OrdersResponse to an array of Order entities.
   * @param response - The API response containing orders.
   * @returns An array of Order entities.
   */
  toEntitiesFromResponse(response: OrdersResponse): Order[] {
    return response.orders.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a GarmentResource to a Garment entity.
   * @param resource - The resource to convert.
   * @param orderId - The ID of the order that contains the garment.
   * @returns The converted Garment entity.
   */
  private toGarmentFromResource(resource: GarmentResource, orderId: number): Garment {
    return new Garment({
      id: resource.id,
      orderId,
      type: resource.type,
      color: resource.color,
      notes: resource.notes,
      quantity: resource.quantity,
      unitPrice: resource.unitPrice
    });
  }

  /**
   * Converts a Garment entity to a GarmentResource.
   * @param garment - The entity to convert.
   * @returns The converted GarmentResource.
   */
  private toResourceFromGarment(garment: Garment): GarmentResource {
    return {
      id: garment.id,
      type: garment.type,
      color: garment.color,
      notes: garment.notes,
      quantity: garment.quantity,
      unitPrice: garment.unitPrice
    };
  }
}
