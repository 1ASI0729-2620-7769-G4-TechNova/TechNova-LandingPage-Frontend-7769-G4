import {computed, inject, Injectable, signal} from '@angular/core';
import {DeliveryApi} from '../infrastructure/delivery-api';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {TrackingEvent} from '../domain/model/tracking-event.entity';

/**
 * Application state of the Delivery bounded context (deliveries and their tracking).
 */
@Injectable({providedIn: 'root'})
export class DeliveryStore {
  private readonly api = inject(DeliveryApi);

  private readonly deliveriesSignal = signal<Delivery[]>([]);
  private readonly eventsSignal = signal<TrackingEvent[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly deliveries = this.deliveriesSignal.asReadonly();
  /** Tracking history of the delivery last loaded with {@link fetchTracking}. */
  readonly events = this.eventsSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  /** Deliveries still to be completed. */
  readonly activeCount = computed(() =>
    this.deliveriesSignal().filter(delivery => !delivery.isClosed()).length);

  fetchDeliveries(): void {
    this.api.getDeliveries().subscribe({
      next: deliveries => {
        this.deliveriesSignal.set(deliveries);
        this.loadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Returns a loaded delivery by identifier. */
  getDeliveryById(id: number): Delivery | undefined {
    return this.deliveriesSignal().find(delivery => delivery.id === id);
  }

  /** Loads the tracking history of a delivery. */
  fetchTracking(deliveryId: number): void {
    this.eventsSignal.set([]);
    this.api.getTrackingEvents(deliveryId).subscribe({
      next: events => this.eventsSignal.set(events),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Schedules a delivery and, on success, runs the optional callback with the stored delivery. */
  scheduleDelivery(delivery: Delivery, onSuccess?: (created: Delivery) => void): void {
    this.errorsSignal.set([]);
    this.api.scheduleDelivery(delivery).subscribe({
      next: created => {
        this.deliveriesSignal.update(deliveries => [...deliveries, created]);
        onSuccess?.(created);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Moves the delivery to the next step of the flow (scheduled → on the way → completed). */
  advance(id: number): void {
    const next = this.getDeliveryById(id)?.nextStatus();
    if (next) this.changeStatus(id, next);
  }

  /** Marks an on-the-way delivery as failed. */
  markFailed(id: number): void {
    if (this.getDeliveryById(id)?.status === DeliveryStatus.ON_THE_WAY) {
      this.changeStatus(id, DeliveryStatus.FAILED);
    }
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }

  private changeStatus(id: number, status: DeliveryStatus): void {
    const delivery = this.getDeliveryById(id);
    if (!delivery) return;
    this.errorsSignal.set([]);
    this.api.updateStatus(delivery, status).subscribe({
      next: updated => {
        this.deliveriesSignal.update(deliveries => deliveries.map(d => d.id === updated.id ? updated : d));
        this.fetchTracking(updated.id);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }
}
