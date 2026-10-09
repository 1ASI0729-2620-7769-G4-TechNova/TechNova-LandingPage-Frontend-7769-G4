import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {TrackingEvent} from '../domain/model/tracking-event.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {TrackingEventResource, TrackingEventsResponse} from './tracking-event-resource';

/**
 * Converts between {@link TrackingEvent} and its API representation.
 */
export class TrackingEventAssembler
  implements BaseAssembler<TrackingEvent, TrackingEventResource, TrackingEventsResponse> {

  toEntityFromResource(resource: TrackingEventResource): TrackingEvent {
    return new TrackingEvent(
      resource.id,
      resource.deliveryId,
      resource.status as DeliveryStatus,
      resource.note,
      resource.occurredAt
    );
  }

  toResourceFromEntity(entity: TrackingEvent): TrackingEventResource {
    return {
      id: entity.id,
      deliveryId: entity.deliveryId,
      status: entity.status,
      note: entity.note,
      occurredAt: entity.occurredAt
    };
  }

  toEntitiesFromResponse(response: TrackingEventsResponse): TrackingEvent[] {
    return response.trackingEvents.map(resource => this.toEntityFromResource(resource));
  }
}
