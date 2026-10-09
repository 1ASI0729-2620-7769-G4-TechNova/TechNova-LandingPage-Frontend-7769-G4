import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Order} from '../domain/model/order.entity';
import {OrderStatus} from '../domain/model/order-status';
import {OrdersApiEndpoint} from './orders-api-endpoint';

/**
 * Infrastructure facade for order endpoint operations.
 */
@Injectable({providedIn: 'root'})
export class OrderManagementApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly ordersEndpoint = new OrdersApiEndpoint(this.http);

  /**
   * Retrieves all orders.
   * @returns Stream with the order collection.
   */
  getOrders(): Observable<Order[]> {
    return this.ordersEndpoint.getAll();
  }

  /**
   * Creates a new order.
   * The API layer assigns the next order number and the creation date, and forces the PENDING status.
   * @param order - The order to create.
   * @returns An Observable of the created Order object.
   */
  createOrder(order: Order): Observable<Order> {
    return this.ordersEndpoint.getAll().pipe(
      switchMap(existingOrders => this.ordersEndpoint.create(this.buildNewOrder(order, existingOrders)))
    );
  }

  /**
   * Confirms a pending order. Fails with an i18n key as message if the order is not pending.
   * @param id - The ID of the order to confirm.
   * @returns An Observable of the confirmed Order object.
   */
  confirmOrder(id: number): Observable<Order> {
    return this.ordersEndpoint.getById(id).pipe(
      switchMap(order => this.ordersEndpoint.update(order.confirm(), id))
    );
  }

  /**
   * Completes a confirmed order. Fails with an i18n key as message if the order is not confirmed.
   * @param id - The ID of the order to complete.
   * @returns An Observable of the completed Order object.
   */
  completeOrder(id: number): Observable<Order> {
    return this.ordersEndpoint.getById(id).pipe(
      switchMap(order => this.ordersEndpoint.update(order.complete(), id))
    );
  }

  /**
   * Builds the order that will be stored: new order number, PENDING status, creation date and no identifier.
   * The identifier is left undefined so json-server generates it (JSON drops undefined fields).
   * @param order - The order to register.
   * @param existingOrders - The orders already stored.
   * @returns The order ready to be stored.
   */
  private buildNewOrder(order: Order, existingOrders: Order[]): Order {
    return new Order({
      id: undefined as unknown as number,
      orderNumber: Order.buildOrderNumber(this.nextSequence(existingOrders)),
      customerId: order.customerId,
      deliveryMethod: order.deliveryMethod,
      status: OrderStatus.PENDING,
      totalAmount: order.totalAmount,
      createdAt: new Date().toISOString(),
      garments: order.garments
    });
  }

  /**
   * Calculates the position of the next order from the highest order number already stored.
   * @param existingOrders - The orders already stored.
   * @returns The sequence position of the next order.
   */
  private nextSequence(existingOrders: Order[]): number {
    const prefix = `${Order.ORDER_NUMBER_PREFIX}-`;
    const highestSequence = existingOrders
      .map(order => Number(order.orderNumber.replace(prefix, '')))
      .filter(sequence => Number.isFinite(sequence))
      .reduce((highest, sequence) => Math.max(highest, sequence), 0);
    return highestSequence + 1;
  }
}
