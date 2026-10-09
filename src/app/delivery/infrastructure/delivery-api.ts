import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {DeliveriesApiEndpoint} from './delivery-api-endpoints';

/**
 * Facade of the Delivery bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class DeliveryApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly deliveriesEndpoint = new DeliveriesApiEndpoint(this.http);

  /** Fetches every delivery. */
  getDeliveries(): Observable<Delivery[]> {
    return this.deliveriesEndpoint.getAll();
  }

  /** Fetches one delivery by identifier. */
  getDeliveryById(id: number): Observable<Delivery> {
    return this.deliveriesEndpoint.getById(id);
  }

  /** Schedules a delivery. Errors carry an i18n key as message. */
  scheduleDelivery(delivery: Delivery): Observable<Delivery> {
    if (new Date(delivery.scheduledAt).getTime() < Date.now() - 60_000) {
      return throwError(() => new Error('delivery.errors.past-date'));
    }
    // The id is left undefined so json-server generates it (JSON drops undefined fields).
    return this.deliveriesEndpoint.create(
      this.copyOf(delivery, undefined as unknown as number, delivery.status, delivery.completedAt));
  }

  /** Moves the delivery to a new status. */
  updateStatus(delivery: Delivery, status: DeliveryStatus): Observable<Delivery> {
    const completedAt = status === DeliveryStatus.COMPLETED ? new Date().toISOString() : delivery.completedAt;
    return this.deliveriesEndpoint.update(this.copyOf(delivery, delivery.id, status, completedAt), delivery.id);
  }

  private copyOf(delivery: Delivery, id: number, status: DeliveryStatus, completedAt: string): Delivery {
    return new Delivery(id, delivery.orderId, delivery.customerName, delivery.type, delivery.address,
      delivery.driverName, delivery.scheduledAt, status, completedAt);
  }
}
