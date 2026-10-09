import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {OrderTracking} from '../domain/model/order-tracking.entity';
import {StageChange} from '../domain/model/stage-change.entity';
import {Notification} from '../domain/model/notification.entity';
import {NotificationsApiEndpoint, OrderTrackingsApiEndpoint, StageChangesApiEndpoint} from './tracking-api-endpoints';
import {NotificationAssembler} from './notification-assembler';
import {StageChangeAssembler} from './stage-change-assembler';
import {NotificationResource} from './notification-resource';
import {StageChangeResource} from './stage-change-resource';

/**
 * Facade of the Tracking bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class TrackingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly trackingsEndpoint = new OrderTrackingsApiEndpoint(this.http);
  private readonly stageChangesEndpoint = new StageChangesApiEndpoint(this.http);
  private readonly notificationsEndpoint = new NotificationsApiEndpoint(this.http);
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
   * Nothing is written when the customer does not exist. Errors carry an i18n key as message.
   */
  advanceStage(tracking: OrderTracking): Observable<OrderTracking> {
    const next = tracking.nextStage();
    if (!next) {
      return throwError(() => new Error('tracking.errors.already-delivered'));
    }
    const now = new Date().toISOString();
    return this.http.get(`${environment.apiBaseUrl}/users/${tracking.customerId}`).pipe(
      catchError(() => throwError(() => new Error('tracking.errors.recipient-not-found'))),
      switchMap(() => this.trackingsEndpoint.update(
        new OrderTracking(tracking.id, tracking.orderId, tracking.orderNumber, tracking.customerId, next, now),
        tracking.id)),
      // The ids are left undefined so json-server generates them.
      switchMap(updated => this.stageChangesEndpoint.create(
        new StageChange(undefined as unknown as number, updated.orderId, next, now)).pipe(map(() => updated))),
      switchMap(updated => this.notificationsEndpoint.create(
        new Notification(undefined as unknown as number, updated.customerId, updated.orderId,
          updated.orderNumber, next, now, false)).pipe(map(() => updated)))
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
