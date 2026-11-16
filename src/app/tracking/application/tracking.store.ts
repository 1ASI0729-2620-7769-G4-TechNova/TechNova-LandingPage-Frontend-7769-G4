import {computed, inject, Injectable, signal} from '@angular/core';
import {TrackingApi} from '../infrastructure/tracking-api';
import {OrderTracking} from '../domain/model/order-tracking.entity';
import {StageChange} from '../domain/model/stage-change.entity';
import {Notification} from '../domain/model/notification.entity';
import {OrderStage} from '../domain/model/order-stage';

/**
 * Application state of the Tracking bounded context: stage of the orders and notifications to customers.
 */
@Injectable({providedIn: 'root'})
export class TrackingStore {
  private readonly api = inject(TrackingApi);

  private readonly trackingsSignal = signal<OrderTracking[]>([]);
  private readonly stageChangesSignal = signal<StageChange[]>([]);
  private readonly notificationsSignal = signal<Notification[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly trackings = this.trackingsSignal.asReadonly();
  /** Stage history of the order last loaded with {@link fetchStageChanges}. */
  readonly stageChanges = this.stageChangesSignal.asReadonly();
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(notification => !notification.read).length);

  fetchTrackings(): void {
    this.api.getOrderTrackings().subscribe({
      next: trackings => {
        this.trackingsSignal.set(trackings);
        this.loadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Returns the loaded tracking of an order. */
  getTrackingByOrderId(orderId: number): OrderTracking | undefined {
    return this.trackingsSignal().find(tracking => tracking.orderId === orderId);
  }

  fetchStageChanges(orderId: number): void {
    this.stageChangesSignal.set([]);
    this.api.getStageChanges(orderId).subscribe({
      next: changes => this.stageChangesSignal.set(changes),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  fetchNotifications(recipientId: number): void {
    this.api.getNotifications(recipientId).subscribe({
      next: notifications => this.notificationsSignal.set(notifications),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Moves an order to its next stage; the customer is notified by the API facade. */
  advance(orderId: number): void {
    const tracking = this.getTrackingByOrderId(orderId);
    if (!tracking) return;
    this.errorsSignal.set([]);
    this.api.advanceStage(tracking).subscribe({
      next: updated => {
        this.trackingsSignal.update(trackings => trackings.map(t => t.id === updated.id ? updated : t));
        this.fetchStageChanges(updated.orderId);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Starts tracking an order in its first stage; the customer is notified. Used by Laundry Operations. */
  startTracking(orderId: number, orderNumber: string, customerId: number): void {
    this.api.startTracking(orderId, orderNumber, customerId).subscribe({
      next: () => this.fetchTrackings(),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Moves a tracked order forward to a stage; the customer is notified. Used by Laundry Operations and Delivery. */
  moveToStage(orderId: number, stage: OrderStage): void {
    this.api.moveToStage(orderId, stage).subscribe({
      next: () => this.fetchTrackings(),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  markAsRead(id: number): void {
    const notification = this.notificationsSignal().find(n => n.id === id);
    if (!notification || notification.read) return;
    this.api.markAsRead(notification).subscribe({
      next: updated => this.notificationsSignal.update(list => list.map(n => n.id === updated.id ? updated : n)),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  markAllAsRead(): void {
    this.notificationsSignal().filter(notification => !notification.read)
      .forEach(notification => this.markAsRead(notification.id));
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }
}
