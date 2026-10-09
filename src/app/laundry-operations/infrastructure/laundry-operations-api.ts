import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {LaundryOrder} from '../domain/model/laundry-order.entity';
import {LaundryStatus} from '../domain/model/laundry-status';
import {ReceivableOrder} from '../domain/model/receivable-order';
import {LaundryOrdersApiEndpoint} from './laundry-operations-api-endpoints';
import {ConfirmedOrderResource} from './laundry-order-resource';

/**
 * Facade of the Laundry Operations bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class LaundryOperationsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly laundryOrdersEndpoint = new LaundryOrdersApiEndpoint(this.http);

  /** Fetches every order being processed or already processed by the laundry. */
  getLaundryOrders(): Observable<LaundryOrder[]> {
    return this.laundryOrdersEndpoint.getAll();
  }

  /** Fetches the confirmed orders, which are the ones the laundry can receive. */
  getConfirmedOrders(): Observable<ReceivableOrder[]> {
    return this.http.get<ConfirmedOrderResource[]>(`${environment.apiBaseUrl}/orders`,
      {params: {status: 'CONFIRMED'}}).pipe(
      map(list => list.map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        garmentCount: order.garments.reduce((total, garment) => total + garment.quantity, 0),
        createdAt: order.createdAt
      })))
    );
  }

  /** Registers the reception of an order. Errors carry an i18n key as message. */
  receiveOrder(order: ReceivableOrder): Observable<LaundryOrder> {
    if (!(order.garmentCount > 0)) {
      return throwError(() => new Error('laundry-operations.errors.no-garments'));
    }
    const now = new Date().toISOString();
    // The id is left undefined so json-server generates it (JSON drops undefined fields).
    return this.laundryOrdersEndpoint.create(new LaundryOrder(undefined as unknown as number, order.orderId,
      order.orderNumber, order.customerId, order.garmentCount, LaundryStatus.RECEIVED, now, now));
  }

  /** Moves the order to the next processing stage. Errors carry an i18n key as message. */
  advance(order: LaundryOrder): Observable<LaundryOrder> {
    const next = order.nextStatus();
    if (!next) {
      return throwError(() => new Error('laundry-operations.errors.already-ready'));
    }
    return this.laundryOrdersEndpoint.update(new LaundryOrder(order.id, order.orderId, order.orderNumber,
      order.customerId, order.garmentCount, next, order.receivedAt, new Date().toISOString()), order.id);
  }
}
