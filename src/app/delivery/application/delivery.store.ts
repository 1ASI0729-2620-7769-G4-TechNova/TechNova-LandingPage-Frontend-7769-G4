import {computed, inject, Injectable, signal} from '@angular/core';
import {DeliveryApi} from '../infrastructure/delivery-api';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';

/**
 * Application state of the Delivery bounded context (pickups and deliveries).
 */
@Injectable({providedIn: 'root'})
export class DeliveryStore {
  private readonly api = inject(DeliveryApi);

  private readonly deliveriesSignal = signal<Delivery[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly deliveries = this.deliveriesSignal.asReadonly();
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
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }
}
