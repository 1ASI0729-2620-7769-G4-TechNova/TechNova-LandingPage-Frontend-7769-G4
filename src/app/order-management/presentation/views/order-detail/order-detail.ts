import {Component, computed, inject} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {BillingStore} from '../../../../billing/application/billing.store';
import {PaymentStatus} from '../../../../billing/domain/model/payment-status';
import {DeliveryStore} from '../../../../delivery/application/delivery.store';
import {Delivery} from '../../../../delivery/domain/model/delivery.entity';
import {DeliveryType} from '../../../../delivery/domain/model/delivery-type';
import {IamStore} from '../../../../iam/application/iam.store';
import {OrderStore} from '../../../application/order.store';
import {roundToCurrency} from '../../../domain/model/money';
import {OrderStatus} from '../../../domain/model/order-status';

/**
 * Represents the data received by the order detail dialog.
 */
export interface OrderDetailData {
  /**
   * The identifier of the order to display.
   */
  orderId: number;
}

/**
 * Displays the detail of an order: customer, drivers, garments breakdown, payment and total.
 * Drivers and payment come from the Delivery and Billing contexts and are only read, never changed.
 * The staff can also move the order forward (confirm or complete it) from here.
 */
@Component({
  selector: 'app-order-detail',
  imports: [
    CurrencyPipe, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
    MatButtonModule, MatIconModule, TranslatePipe
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail {
  private readonly data = inject<OrderDetailData>(MAT_DIALOG_DATA);
  private readonly store = inject(OrderStore);
  private readonly iamStore = inject(IamStore);
  private readonly deliveryStore = inject(DeliveryStore);
  private readonly billingStore = inject(BillingStore);

  /**
   * Signal indicating if the store is waiting for the API.
   */
  readonly loading = this.store.loading;

  /**
   * Signal for the i18n key of the current error, or null when there is none.
   */
  readonly error = this.store.error;

  /**
   * The statuses used by the template to decide which action is available.
   */
  protected readonly orderStatus = OrderStatus;

  /**
   * The currency used to display every amount.
   */
  protected readonly currencyCode = environment.currencyCode;

  /**
   * The symbol used to display every amount.
   */
  protected readonly currencySymbol = environment.currencySymbol;

  /**
   * Computed signal for the order being displayed.
   * It is read from the store, so it refreshes after a status change.
   */
  protected readonly order = computed(() =>
    this.store.orders().find(order => order.id === this.data.orderId));

  /**
   * Computed signal for the customer that requested the order, or undefined when the customer is not loaded.
   */
  protected readonly customer = computed(() => {
    const order = this.order();
    return order ? this.iamStore.getUserById(order.customerId) : undefined;
  });

  /**
   * Computed signal for the logistic services of the order: the pickup of the garments and their delivery.
   */
  protected readonly logisticServices = computed(() => [
    {titleKey: 'order-management.detail.pickup-driver', delivery: this.findDelivery(DeliveryType.PICKUP)},
    {titleKey: 'order-management.detail.delivery-driver', delivery: this.findDelivery(DeliveryType.DELIVERY)}
  ]);

  /**
   * Computed signal for the payment of the order; a confirmed payment is preferred over any other.
   */
  protected readonly payment = computed(() => {
    const orderPayments = this.billingStore.payments().filter(payment => payment.orderId === this.data.orderId);
    return orderPayments.find(payment => payment.status === PaymentStatus.CONFIRMED) ?? orderPayments[0];
  });

  /**
   * Computed signal for the delivery fee included in the total: the total minus the garments subtotal.
   */
  protected readonly deliveryFee = computed(() => {
    const order = this.order();
    return order ? roundToCurrency(order.totalAmount - order.subtotal) : 0;
  });

  /**
   * Creates an instance of OrderDetail and loads the deliveries and payments displayed with the order.
   */
  constructor() {
    this.deliveryStore.fetchDeliveries();
    this.billingStore.fetchPayments();
  }

  /**
   * Confirms the order of the dialog.
   */
  protected confirmOrder(): void {
    this.store.confirmOrder(this.data.orderId);
  }

  /**
   * Completes the order of the dialog.
   */
  protected completeOrder(): void {
    this.store.completeOrder(this.data.orderId);
  }

  /**
   * Finds the delivery of the order for a kind of logistic service.
   * @param type - The kind of service: pickup or delivery.
   * @returns The delivery, or undefined when none has been scheduled.
   */
  private findDelivery(type: DeliveryType): Delivery | undefined {
    return this.deliveryStore.deliveries()
      .find(delivery => delivery.orderId === this.data.orderId && delivery.type === type);
  }
}
