import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {DeliveryStatus} from '../../delivery/domain/model/delivery-status';
import {TrackingEvent} from '../domain/model/tracking-event.entity';
import {TrackingEventsApiEndpoint} from './tracking-api-endpoints';
import {TrackingEventAssembler} from './tracking-event-assembler';
import {TrackingEventResource} from './tracking-event-resource';

/**
 * Facade of the Tracking bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class TrackingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly eventsEndpoint = new TrackingEventsApiEndpoint(this.http);
  private readonly eventAssembler = new TrackingEventAssembler();

  /** Fetches the tracking history of a delivery, oldest first. */
  getTrackingEvents(deliveryId: number): Observable<TrackingEvent[]> {
    return this.http.get<TrackingEventResource[]>(`${environment.apiBaseUrl}/trackingEvents`,
      {params: {deliveryId}}).pipe(
      map(list => list
        .map(resource => this.eventAssembler.toEntityFromResource(resource))
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)))
    );
  }

  /** Records that a delivery reached a status. */
  recordEvent(deliveryId: number, status: DeliveryStatus): Observable<TrackingEvent> {
    // The id is left undefined so json-server generates it.
    return this.eventsEndpoint.create(new TrackingEvent(undefined as unknown as number,
      deliveryId, status, `tracking.events.${status}`, new Date().toISOString()));
  }
}
