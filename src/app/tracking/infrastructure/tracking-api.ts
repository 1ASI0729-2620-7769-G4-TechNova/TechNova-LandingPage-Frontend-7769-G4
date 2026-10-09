import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {OrderTracking} from '../domain/model/order-tracking.entity';
import {ORDER_STAGES, OrderStage} from '../domain/model/order-stage';
import {StageChange} from '../domain/model/stage-change.entity';
import {Notification} from '../domain/model/notification.entity';
import {NotificationsApiEndpoint, OrderTrackingsApiEndpoint, StageChangesApiEndpoint} from './tracking-api-endpoints';
import {NotificationAssembler} from './notification-assembler';
import {StageChangeAssembler} from './stage-change-assembler';
import {NotificationResource} from './notification-resource';
import {StageChangeResource} from './stage-change-resource';
import {OrderTrackingAssembler} from './order-tracking-assembler';
import {OrderTrackingResource} from './order-tracking-resource';

/**
 * Facade of the Tracking bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class TrackingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly trackingsEndpoint = new OrderTrackingsApiEndpoint(this.http);
  private readonly stageChangesEndpoint = new StageChangesApiEndpoint(this.http);
  private readonly notificationsEndpoint = new NotificationsApiEndpoint(this.http);
  private readonly trackingAssembler = new OrderTrackingAssembler();
  private readonly stageChangeAssembler = new StageChangeAssembler();
  private readonly notificationAssembler = new NotificationAssembler();

  /** Fetches the tracking of every order. */
  getOrderTrackings(): Observable<OrderTracking[]> {
    return this.trackingsEndpoint.getAll();
  }

  /** Fetches the stage history of an order, oldest first. */
  getStageChanges(orderId: number): Observable<StageChange[]> {
    return this.http.get<StageChangeResource[]>(`${environment.apiBaseUrl}/stageChanges`,
      {params: {orderId}}).pipe(
      map(list => list
        .map(resource => this.stageChangeAssembler.toEntityFromResource(resource))
        .sort((a, b) => a.changedAt.localeCompare(b.changedAt)))
    );
  }

  /** Fetches the notifications of a user, newest first. */
  getNotifications(recipientId: number): Observable<Notification[]> {
    return this.http.get<NotificationResource[]>(`${environment.apiBaseUrl}/notifications`,
      {params: {recipientId}}).pipe(
      map(list => list
        .map(resource => this.notificationAssembler.toEntityFromResource(resource))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    );
  }

  /**
   * Moves an order to its next stage, keeps the change and notifies the customer.
   * Errors carry an i18n key as message.
   */
  advanceStage(tracking: OrderTracking): Observable<OrderTracking> {
    const next = tracking.nextStage();
    return next ? this.applyStage(tracking, next) : throwError(() => new Error('tracking.errors.already-delivered'));
  }

  /**
   * Starts the tracking of an order in the first stage and notifies the customer.
   * Does nothing when the order is already being tracked.
   */
  startTracking(orderId: number, orderNumber: string, customerId: number): Observable<OrderTracking> {
    return this.findByOrderId(orderId).pipe(
      switchMap(existing => existing ? of(existing) : this.verifyRecipient(customerId).pipe(
        // The id is left undefined so json-server generates it (JSON drops undefined fields).
        switchMap(() => this.trackingsEndpoint.create(new OrderTracking(undefined as unknown as number,
          orderId, orderNumber, customerId, ORDER_STAGES[0], new Date().toISOString()))),
        switchMap(created => this.recordChange(created, created.stage))))
    );
  }

  /**
   * Moves a tracked order forward to the given stage (skipping the ones in between).
   * Does nothing when the order is not tracked or it already reached that stage.
   */
  moveToStage(orderId: number, stage: OrderStage): Observable<OrderTracking | null> {
    return this.findByOrderId(orderId).pipe(
      switchMap(tracking => tracking && ORDER_STAGES.indexOf(stage) > tracking.stageIndex()
        ? this.applyStage(tracking, stage) : of(tracking))
    );
  }

  private findByOrderId(orderId: number): Observable<OrderTracking | null> {
    return this.http.get<OrderTrackingResource[]>(`${environment.apiBaseUrl}/orderTrackings`,
      {params: {orderId}}).pipe(
      map(list => list.length > 0 ? this.trackingAssembler.toEntityFromResource(list[0]) : null)
    );
  }

  private verifyRecipient(customerId: number): Observable<unknown> {
    return this.http.get(`${environment.apiBaseUrl}/users/${customerId}`).pipe(
      catchError(() => throwError(() => new Error('tracking.errors.recipient-not-found')))
    );
  }

  private applyStage(tracking: OrderTracking, stage: OrderStage): Observable<OrderTracking> {
    return this.verifyRecipient(tracking.customerId).pipe(
      switchMap(() => this.trackingsEndpoint.update(new OrderTracking(tracking.id, tracking.orderId,
        tracking.orderNumber, tracking.customerId, stage, new Date().toISOString()), tracking.id)),
      switchMap(updated => this.recordChange(updated, stage))
    );
  }

  /** Keeps the stage change and notifies the customer. The ids are left undefined for json-server. */
  private recordChange(tracking: OrderTracking, stage: OrderStage): Observable<OrderTracking> {
    const now = new Date().toISOString();
    return this.stageChangesEndpoint.create(
      new StageChange(undefined as unknown as number, tracking.orderId, stage, now)).pipe(
      switchMap(() => this.notificationsEndpoint.create(new Notification(undefined as unknown as number,
        tracking.customerId, tracking.orderId, tracking.orderNumber, stage, now, false))),
      map(() => tracking)
    );
  }

  /** Marks a notification as read. */
  markAsRead(notification: Notification): Observable<Notification> {
    return this.notificationsEndpoint.update(
      new Notification(notification.id, notification.recipientId, notification.orderId,
        notification.orderNumber, notification.stage, notification.createdAt, true),
      notification.id);
  }
}
