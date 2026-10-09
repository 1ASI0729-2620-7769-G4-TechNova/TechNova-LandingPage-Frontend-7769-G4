import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {TrackingEvent} from '../domain/model/tracking-event.entity';
import {DeliveriesApiEndpoint, TrackingEventsApiEndpoint} from './delivery-api-endpoints';
import {TrackingEventAssembler} from './tracking-event-assembler';
import {TrackingEventResource} from './tracking-event-resource';

/**
 * Facade of the Delivery bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class DeliveryApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly deliveriesEndpoint = new DeliveriesApiEndpoint(this.http);
  private readonly trackingEventsEndpoint = new TrackingEventsApiEndpoint(this.http);
  private readonly trackingEventAssembler = new TrackingEventAssembler();

  /** Fetches every delivery. */
  getDeliveries(): Observable<Delivery[]> {
    return this.deliveriesEndpoint.getAll();
  }

  /** Fetches one delivery by identifier. */
  getDeliveryById(id: number): Observable<Delivery> {
    return this.deliveriesEndpoint.getById(id);
  }

  /** Fetches the tracking history of a delivery, oldest first. */
  getTrackingEvents(deliveryId: number): Observable<TrackingEvent[]> {
    return this.http.get<TrackingEventResource[]>(`${environment.apiBaseUrl}/trackingEvents`,
      {params: {deliveryId}}).pipe(
      map(list => list
        .map(resource => this.trackingEventAssembler.toEntityFromResource(resource))
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)))
    );
  }

  /**
   * Schedules a delivery and records its first tracking event. Errors carry an i18n key as message.
   */
  scheduleDelivery(delivery: Delivery): Observable<Delivery> {
    if (new Date(delivery.scheduledAt).getTime() < Date.now() - 60_000) {
      return throwError(() => new Error('delivery.errors.past-date'));
    }
    // The id is left undefined so json-server generates it (JSON drops undefined fields).
    return this.deliveriesEndpoint.create(this.copyOf(delivery, undefined as unknown as number, delivery.status, delivery.completedAt)).pipe(
      switchMap(created => this.recordEvent(created.id, created.status, 'delivery.events.SCHEDULED')
        .pipe(map(() => created)))
    );
  }

  /** Moves the delivery to a new status and records it in the tracking history. */
  updateStatus(delivery: Delivery, status: DeliveryStatus): Observable<Delivery> {
    const completedAt = status === DeliveryStatus.COMPLETED ? new Date().toISOString() : delivery.completedAt;
    return this.deliveriesEndpoint.update(this.copyOf(delivery, delivery.id, status, completedAt), delivery.id).pipe(
      switchMap(updated => this.recordEvent(updated.id, status, `delivery.events.${status}`).pipe(map(() => updated)))
    );
  }

  private copyOf(delivery: Delivery, id: number, status: DeliveryStatus, completedAt: string): Delivery {
    return new Delivery(id, delivery.orderId, delivery.customerName, delivery.type, delivery.address,
      delivery.driverName, delivery.scheduledAt, status, completedAt);
  }

  private recordEvent(deliveryId: number, status: DeliveryStatus, note: string): Observable<TrackingEvent> {
    // The id is left undefined so json-server generates it.
    return this.trackingEventsEndpoint.create(new TrackingEvent(undefined as unknown as number,
      deliveryId, status, note, new Date().toISOString()));
  }
}
