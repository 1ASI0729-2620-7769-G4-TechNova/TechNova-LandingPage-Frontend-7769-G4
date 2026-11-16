import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Order} from '../domain/model/order.entity';
import {OrderAssembler} from './order.assembler';
import {OrderResource} from './order.resource';
import {OrdersApiEndpoint} from './orders-api-endpoint';

/**
 * API facade of the Order Management bounded context.
 */
@Injectable({providedIn: 'root'})
export class OrderManagementApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly ordersEndpoint = new OrdersApiEndpoint(this.http);
  private readonly orderAssembler = new OrderAssembler();
  private readonly ordersUrl = `${environment.apiBaseUrl}${environment.ordersEndpointPath}`;

  /** The API lists orders per laundry, so the dashboard asks for the laundry it manages. */
  getOrders(): Observable<Order[]> {
    return this.http.get<OrderResource[]>(this.ordersUrl, {params: {laundryId: environment.laundryId}}).pipe(
      map(list => list.map(resource => this.orderAssembler.toEntityFromResource(resource)))
    );
  }

  /** Creates the order as DRAFT; the API assigns the order number. */
  createOrder(order: Order): Observable<Order> {
    return this.ordersEndpoint.create(order);
  }

  confirmOrder(id: number): Observable<Order> {
    return this.http.post<OrderResource>(`${this.ordersUrl}/${id}/confirm`, {}).pipe(
      map(resource => this.orderAssembler.toEntityFromResource(resource))
    );
  }

  /**
   * shortcut: the API has no "complete" transition yet, so the order is completed in the client only;
   * upgrade when Order Management exposes it.
   */
  completeOrder(id: number): Observable<Order> {
    return this.ordersEndpoint.getById(id).pipe(map(order => order.complete()));
  }
}
