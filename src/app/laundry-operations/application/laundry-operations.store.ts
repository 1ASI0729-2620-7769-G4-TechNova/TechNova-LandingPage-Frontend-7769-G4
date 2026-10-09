import {computed, inject, Injectable, signal} from '@angular/core';
import {LaundryOperationsApi} from '../infrastructure/laundry-operations-api';
import {LaundryOrder} from '../domain/model/laundry-order.entity';
import {ReceivableOrder} from '../domain/model/receivable-order';

/**
 * Application state of the Laundry Operations bounded context (reception and processing of orders).
 */
@Injectable({providedIn: 'root'})
export class LaundryOperationsStore {
  private readonly api = inject(LaundryOperationsApi);

  private readonly laundryOrdersSignal = signal<LaundryOrder[]>([]);
  private readonly confirmedOrdersSignal = signal<ReceivableOrder[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly laundryOrders = this.laundryOrdersSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  /** Confirmed orders that the laundry has not received yet. */
  readonly pendingReception = computed(() => {
    const received = new Set(this.laundryOrdersSignal().map(order => order.orderId));
    return this.confirmedOrdersSignal().filter(order => !received.has(order.orderId));
  });

  fetchLaundryOrders(): void {
    this.api.getLaundryOrders().subscribe({
      next: orders => {
        this.laundryOrdersSignal.set(orders);
        this.loadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  fetchConfirmedOrders(): void {
    this.api.getConfirmedOrders().subscribe({
      next: orders => this.confirmedOrdersSignal.set(orders),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Receives a confirmed order into the laundry. */
  receive(order: ReceivableOrder): void {
    this.errorsSignal.set([]);
    this.api.receiveOrder(order).subscribe({
      next: created => this.laundryOrdersSignal.update(orders => [...orders, created]),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Moves a laundry order to the next stage of the processing. */
  advance(id: number): void {
    const order = this.laundryOrdersSignal().find(o => o.id === id);
    if (!order) return;
    this.errorsSignal.set([]);
    this.api.advance(order).subscribe({
      next: updated => this.laundryOrdersSignal.update(orders => orders.map(o => o.id === updated.id ? updated : o)),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }
}
