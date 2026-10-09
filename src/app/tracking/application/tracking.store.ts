import {inject, Injectable, signal} from '@angular/core';
import {TrackingApi} from '../infrastructure/tracking-api';
import {DeliveryStatus} from '../../delivery/domain/model/delivery-status';
import {TrackingEvent} from '../domain/model/tracking-event.entity';

/**
 * Application state of the Tracking bounded context (history of a delivery).
 */
@Injectable({providedIn: 'root'})
export class TrackingStore {
  private readonly api = inject(TrackingApi);

  private readonly eventsSignal = signal<TrackingEvent[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private currentDeliveryId = 0;

  /** Tracking history of the delivery last loaded with {@link fetchTracking}. */
  readonly events = this.eventsSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();

  fetchTracking(deliveryId: number): void {
    this.currentDeliveryId = deliveryId;
    this.eventsSignal.set([]);
    this.api.getTrackingEvents(deliveryId).subscribe({
      next: events => this.eventsSignal.set(events),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Records that a delivery reached a status; the loaded history grows if it is the same delivery. */
  record(deliveryId: number, status: DeliveryStatus): void {
    this.api.recordEvent(deliveryId, status).subscribe({
      next: event => {
        if (deliveryId === this.currentDeliveryId) {
          this.eventsSignal.update(events => [...events, event]);
        }
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }
}
