import {environment} from '../../../environments/environment';
import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DeliveryMethod} from '../domain/model/delivery-method';
import {Garment} from '../domain/model/garment.entity';
import {Order} from '../domain/model/order.entity';
import {OrderStatus} from '../domain/model/order-status';
import {OrderItemResource, OrderResource, OrdersResponse} from './order.resource';

/** Garment categories accepted by the API, picked from the free-text garment type of the form. */
const GARMENT_CATEGORIES: [RegExp, string][] = [
  [/camis|shirt|blusa|polo/i, 'SHIRT'],
  [/pantal|jean|short|pants/i, 'PANTS'],
  [/terno|traje|saco|suit|abrigo/i, 'SUIT'],
  [/s[aá]bana|cobija|edred|frazada|cama|bedding/i, 'BEDDING'],
  [/delicad|seda|lana|delicate/i, 'DELICATE']
];

/** Statuses of the API that the frontend shows as one of its three statuses. */
const STATUS_FROM_API: Record<string, OrderStatus> = {
  DRAFT: OrderStatus.PENDING,
  CONFIRMED: OrderStatus.CONFIRMED,
  IN_PROCESS: OrderStatus.CONFIRMED,
  READY_FOR_DELIVERY: OrderStatus.CONFIRMED,
  COMPLETED: OrderStatus.COMPLETED,
  CANCELLED: OrderStatus.PENDING
};

const PROMISED_DAYS = 3;

/**
 * Converts orders between the Order Management API and the frontend entity.
 */
export class OrderAssembler implements BaseAssembler<Order, OrderResource, OrdersResponse> {

  toEntityFromResource(resource: OrderResource): Order {
    const deliveryMethod = (resource.specialInstructions ?? '').includes(DeliveryMethod.STORE_PICKUP)
      ? DeliveryMethod.STORE_PICKUP : DeliveryMethod.HOME_DELIVERY;
    const fee = deliveryMethod === DeliveryMethod.HOME_DELIVERY ? environment.deliveryFee : 0;
    return new Order({
      id: resource.id,
      orderNumber: resource.orderNumber ?? '',
      customerId: resource.customerId,
      deliveryMethod,
      status: STATUS_FROM_API[resource.status ?? 'DRAFT'] ?? OrderStatus.PENDING,
      totalAmount: (resource.totalAmount ?? 0) + fee,
      createdAt: resource.createdAt ?? new Date().toISOString(),
      garments: (resource.items ?? []).map(item => this.toGarmentFromResource(item, resource.id))
    });
  }

  toResourceFromEntity(entity: Order): OrderResource {
    const promised = new Date(Date.now() + PROMISED_DAYS * 24 * 60 * 60 * 1000);
    return {
      id: entity.id,
      customerId: entity.customerId,
      laundryId: environment.laundryId,
      promisedDate: promised.toISOString().slice(0, 19),
      currency: environment.currencyCode,
      specialInstructions: entity.deliveryMethod,
      items: entity.garments.map(garment => this.toItemFromGarment(garment))
    };
  }

  toEntitiesFromResponse(response: OrdersResponse): Order[] {
    return response.orders.map(resource => this.toEntityFromResource(resource));
  }

  private toGarmentFromResource(item: OrderItemResource, orderId: number): Garment {
    const [type = item.garmentType, color = '', ...notes] = (item.notes ?? '').split('|');
    return new Garment({
      id: item.id ?? 0,
      orderId,
      type,
      color,
      notes: notes.join('|'),
      quantity: item.quantity,
      unitPrice: item.unitPrice
    });
  }

  private toItemFromGarment(garment: Garment): OrderItemResource {
    const category = GARMENT_CATEGORIES.find(([pattern]) => pattern.test(garment.type));
    return {
      serviceId: 1,
      garmentType: category ? category[1] : 'BULK_LAUNDRY',
      quantity: garment.quantity,
      unitPrice: garment.unitPrice,
      notes: [garment.type, garment.color, garment.notes].join('|').slice(0, 255)
    };
  }
}
