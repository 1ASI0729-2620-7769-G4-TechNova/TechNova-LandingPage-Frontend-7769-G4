import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryStatus} from '../domain/model/delivery-status';
import {DeliveriesApiEndpoint} from './delivery-api-endpoints';
import {DeliveryAssembler} from './delivery-assembler';
import {DeliveryResource} from './delivery-resource';

/**
 * Facade of the Delivery bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class DeliveryApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly deliveriesEndpoint = new DeliveriesApiEndpoint(this.http);
  private readonly deliveryAssembler = new DeliveryAssembler();

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
    const base = `${environment.apiBaseUrl}/deliveries`;
    return this.http.post<DeliveryResource>(base, {
      orderId: delivery.orderId, customerName: delivery.customerName, type: delivery.type,
      address: delivery.address, scheduledAt: delivery.scheduledAt
    }).pipe(
      switchMap(created => this.assignDriver(created, delivery.driverName)),
      map(resource => this.deliveryAssembler.toEntityFromResource(resource))
    );
  }

  /** Moves the delivery to a new status. */
  updateStatus(delivery: Delivery, status: DeliveryStatus): Observable<Delivery> {
    const action = status === DeliveryStatus.ON_THE_WAY ? 'start'
      : status === DeliveryStatus.COMPLETED ? 'complete' : 'fail';
    const body = status === DeliveryStatus.FAILED ? {reason: 'Marked as failed from the dashboard'} : {};
    return this.http.post<DeliveryResource>(`${environment.apiBaseUrl}/deliveries/${delivery.id}/${action}`, body).pipe(
      map(resource => this.deliveryAssembler.toEntityFromResource(resource))
    );
  }

  /** The API assigns drivers by id, while the schedule form picks them by name. */
  private assignDriver(created: DeliveryResource, driverName: string): Observable<DeliveryResource> {
    if (!driverName) return of(created);
    return this.http.get<{ id: number; name: string }[]>(`${environment.apiBaseUrl}/drivers`).pipe(
      map(drivers => drivers.find(driver => driver.name === driverName)),
      switchMap(driver => driver
        ? this.http.patch<DeliveryResource>(`${environment.apiBaseUrl}/deliveries/${created.id}`, {driverId: driver.id})
        : of(created))
    );
  }
}
