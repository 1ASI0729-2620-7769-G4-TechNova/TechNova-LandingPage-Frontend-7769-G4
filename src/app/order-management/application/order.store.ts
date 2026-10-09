import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Order} from '../domain/model/order.entity';
import {OrderManagementApi} from '../infrastructure/order-management-api';

/**
 * The prefix shared by every i18n key of the order management errors.
 */
const ERROR_KEY_PREFIX = 'order-management.errors.';

/**
 * The i18n key shown when the orders cannot be loaded.
 */
const LOAD_FAILED_KEY = `${ERROR_KEY_PREFIX}load-failed`;

/**
 * The i18n key shown when an order cannot be registered.
 */
const CREATE_FAILED_KEY = `${ERROR_KEY_PREFIX}create-failed`;

/**
 * The i18n key shown when an order cannot be confirmed.
 */
const CONFIRM_FAILED_KEY = `${ERROR_KEY_PREFIX}confirm-failed`;

/**
 * The i18n key shown when an order cannot be completed.
 */
const COMPLETE_FAILED_KEY = `${ERROR_KEY_PREFIX}complete-failed`;

/**
 * Holds order management application state and coordinates the order use cases.
 * The business rules live in the {@link Order} entity; the store only calls them and publishes the result.
 * Errors are exposed as i18n keys so the views can translate them.
 */
@Injectable({providedIn: 'root'})
export class OrderStore {
  private readonly api = inject(OrderManagementApi);

  private readonly ordersSignal = signal<Order[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the list of orders.
   */
  readonly orders = this.ordersSignal.asReadonly();

  /**
   * Readonly signal indicating if data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  /**
   * Readonly signal for the i18n key of the current error, or null when there is none.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Creates an instance of OrderStore and loads the existing orders.
   */
  constructor() {
    this.loadOrders();
  }

  /**
   * Registers a new order.
   * Before sending it, the store checks the registration rules and calculates the total amount
   * (garment subtotals plus the delivery fee when the order is delivered at home).
   * @param order - The order to register, with its garments already added.
   * @param onSuccess - Optional action to run once the order has been stored.
   */
  createOrder(order: Order, onSuccess?: () => void): void {
    this.errorSignal.set(null);
    try {
      order.assertCanBeRegistered();
      order.calculateTotalAmount(environment.deliveryFee);
    } catch (error) {
      this.errorSignal.set(this.resolveErrorKey(error, CREATE_FAILED_KEY));
      return;
    }
    this.loadingSignal.set(true);
    this.api.createOrder(order).subscribe({
      next: createdOrder => {
        this.ordersSignal.update(orders => [...orders, createdOrder]);
        this.loadingSignal.set(false);
        onSuccess?.();
      },
      error: error => this.handleFailure(error, CREATE_FAILED_KEY)
    });
  }

  /**
   * Confirms a pending order.
   * @param id - The ID of the order to confirm.
   */
  confirmOrder(id: number): void {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    this.api.confirmOrder(id).subscribe({
      next: confirmedOrder => this.replaceOrder(confirmedOrder),
      error: error => this.handleFailure(error, CONFIRM_FAILED_KEY)
    });
  }

  /**
   * Completes a confirmed order.
   * @param id - The ID of the order to complete.
   */
  completeOrder(id: number): void {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    this.api.completeOrder(id).subscribe({
      next: completedOrder => this.replaceOrder(completedOrder),
      error: error => this.handleFailure(error, COMPLETE_FAILED_KEY)
    });
  }

  /**
   * Loads all orders from the API.
   */
  private loadOrders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getOrders().subscribe({
      next: orders => {
        this.ordersSignal.set(orders);
        this.loadingSignal.set(false);
      },
      error: error => this.handleFailure(error, LOAD_FAILED_KEY)
    });
  }

  /**
   * Replaces an order of the list with its updated version.
   * @param updatedOrder - The order returned by the API after a status change.
   */
  private replaceOrder(updatedOrder: Order): void {
    this.ordersSignal.update(orders =>
      orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    this.loadingSignal.set(false);
  }

  /**
   * Stores the error key of a failed request and stops the loading state.
   * @param error - Source error.
   * @param fallbackKey - i18n key used when the error is not a business rule error.
   */
  private handleFailure(error: unknown, fallbackKey: string): void {
    this.errorSignal.set(this.resolveErrorKey(error, fallbackKey));
    this.loadingSignal.set(false);
  }

  /**
   * Chooses the i18n key to show for an error.
   * Business rule errors already carry their own key; any other error uses the fallback key.
   * @param error - Source error.
   * @param fallbackKey - i18n key used when the error is not a business rule error.
   * @returns The i18n key to show.
   */
  private resolveErrorKey(error: unknown, fallbackKey: string): string {
    if (error instanceof Error && error.message.startsWith(ERROR_KEY_PREFIX)) {
      return error.message;
    }
    return fallbackKey;
  }
}
