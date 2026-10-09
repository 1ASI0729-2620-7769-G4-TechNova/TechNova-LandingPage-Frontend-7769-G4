import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {TrackingEvent} from '../domain/model/tracking-event.entity';
import {TrackingEventAssembler} from './tracking-event-assembler';
import {TrackingEventResource, TrackingEventsResponse} from './tracking-event-resource';

/** CRUD endpoint for tracking events. */
export class TrackingEventsApiEndpoint extends BaseApiEndpoint<
  TrackingEvent, TrackingEventResource, TrackingEventsResponse, TrackingEventAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/trackingEvents`, new TrackingEventAssembler());
  }
}
