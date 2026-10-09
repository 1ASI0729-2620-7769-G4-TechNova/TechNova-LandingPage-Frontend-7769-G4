import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Notification} from '../domain/model/notification.entity';
import {OrderStage} from '../domain/model/order-stage';
import {NotificationResource, NotificationsResponse} from './notification-resource';

/**
 * Converts between {@link Notification} and its API representation.
 */
export class NotificationAssembler
  implements BaseAssembler<Notification, NotificationResource, NotificationsResponse> {

  toEntityFromResource(resource: NotificationResource): Notification {
    return new Notification(
      resource.id,
      resource.recipientId,
      resource.orderId,
      resource.orderNumber,
      resource.stage as OrderStage,
      resource.createdAt,
      resource.read
    );
  }

  toResourceFromEntity(entity: Notification): NotificationResource {
    return {
      id: entity.id,
      recipientId: entity.recipientId,
      orderId: entity.orderId,
      orderNumber: entity.orderNumber,
      stage: entity.stage,
      createdAt: entity.createdAt,
      read: entity.read
    };
  }

  toEntitiesFromResponse(response: NotificationsResponse): Notification[] {
    return response.notifications.map(resource => this.toEntityFromResource(resource));
  }
}
