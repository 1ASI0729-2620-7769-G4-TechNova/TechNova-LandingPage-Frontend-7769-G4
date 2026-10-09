import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Delivery} from '../domain/model/delivery.entity';
import {TrackingEvent} from '../domain/model/tracking-event.entity';
import {DeliveryAssembler} from './delivery-assembler';
import {TrackingEventAssembler} from './tracking-event-assembler';
import {DeliveriesResponse, DeliveryResource} from './delivery-resource';
import {TrackingEventResource, TrackingEventsResponse} from './tracking-event-resource';

/** CRUD endpoint for deliveries. */
export class DeliveriesApiEndpoint extends BaseApiEndpoint<
  Delivery, DeliveryResource, DeliveriesResponse, DeliveryAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/deliveries`, new DeliveryAssembler());
  }
}

/** CRUD endpoint for tracking events. */
export class TrackingEventsApiEndpoint extends BaseApiEndpoint<
  TrackingEvent, TrackingEventResource, TrackingEventsResponse, TrackingEventAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/trackingEvents`, new TrackingEventAssembler());
  }
}
