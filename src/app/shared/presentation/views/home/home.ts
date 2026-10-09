import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {OrderStore} from '../../../../order-management/application/order.store';
import {OrderStatus} from '../../../../order-management/domain/model/order-status';
import {LaundryOperationsStore} from '../../../../laundry-operations/application/laundry-operations.store';
import {DeliveryStore} from '../../../../delivery/application/delivery.store';
import {BillingStore} from '../../../../billing/application/billing.store';
import {PaymentStatus} from '../../../../billing/domain/model/payment-status';
import {TrackingStore} from '../../../../tracking/application/tracking.store';
import {OrderStage} from '../../../../tracking/domain/model/order-stage';

/**
 * A summary card of the dashboard: a figure and the view where it can be managed.
 */
interface DashboardCard {
  icon: string;
  label: string;
  value: string | number;
  link: string;
  /** Visual emphasis of the card. */
  tone?: 'info' | 'warn' | 'ok';
  /** Extra line below the figure (translation key). */
  hint?: string;
}

/**
 * Dashboard of the signed-in user. It summarizes the state of the platform with data of the other
 * bounded contexts: the orders and operation of a laundry, or the orders and notices of a customer.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private readonly iam = inject(IamStore);
  private readonly orders = inject(OrderStore);
  private readonly laundry = inject(LaundryOperationsStore);
  private readonly deliveries = inject(DeliveryStore);
  private readonly billing = inject(BillingStore);
  private readonly tracking = inject(TrackingStore);

  protected readonly user = this.iam.currentUser;
  protected readonly isLaundry = computed(() => this.user()?.accountType === 'LAUNDRY');

  /** Orders that are not completed yet. */
  private readonly activeOrders = computed(() =>
    this.orders.orders().filter(order => order.status !== OrderStatus.COMPLETED));

  protected readonly cards = computed<DashboardCard[]>(() =>
    this.isLaundry() ? this.laundryCards() : this.customerCards());

  constructor() {
    const user = this.user();
    if (user?.accountType === 'LAUNDRY') {
      this.laundry.fetchLaundryOrders();
      this.laundry.fetchConfirmedOrders();
      this.deliveries.fetchDeliveries();
      this.billing.fetchPayments();
      this.billing.fetchPlans();
      this.billing.fetchSubscription(user.id);
    } else {
      this.tracking.fetchTrackings();
    }
  }

  private laundryCards(): DashboardCard[] {
    const inLaundry = this.laundry.laundryOrders();
    const subscription = this.billing.subscription();
    const pendingPayments = this.billing.payments().filter(p => p.status === PaymentStatus.PENDING).length;
    return [
      {icon: 'shopping_bag', label: 'home.cards.active-orders', value: this.activeOrders().length,
        link: '/orders', tone: 'info'},
      {icon: 'qr_code_scanner', label: 'home.cards.awaiting-reception', value: this.laundry.pendingReception().length,
        link: '/operations/reception', tone: 'warn'},
      {icon: 'water_drop', label: 'home.cards.in-process', value: inLaundry.filter(o => !o.isReady()).length,
        link: '/operations/laundry', tone: 'info'},
      {icon: 'inventory_2', label: 'home.cards.ready', value: inLaundry.filter(o => o.isReady()).length,
        link: '/operations/laundry', tone: 'ok'},
      {icon: 'local_shipping', label: 'home.cards.active-deliveries', value: this.deliveries.activeCount(),
        link: '/operations/deliveries', tone: 'info'},
      {icon: 'receipt_long', label: 'home.cards.pending-payments', value: pendingPayments,
        link: '/billing/payments', tone: pendingPayments > 0 ? 'warn' : 'ok'},
      {icon: 'workspace_premium', label: 'home.cards.subscription',
        value: subscription ? subscription.daysToExpire() : '-', link: '/billing/subscription',
        tone: subscription?.isExpiringSoon() || subscription?.isExpired() ? 'warn' : 'ok',
        hint: 'home.cards.days-left'}
    ];
  }

  private customerCards(): DashboardCard[] {
    const userId = this.user()?.id;
    const mine = this.tracking.trackings().filter(t => t.customerId === userId);
    return [
      {icon: 'shopping_bag', label: 'home.cards.my-orders',
        value: this.activeOrders().filter(order => order.customerId === userId).length,
        link: '/orders', tone: 'info'},
      {icon: 'water_drop', label: 'home.cards.in-process',
        value: mine.filter(t => t.stage === OrderStage.RECEIVED || t.stage === OrderStage.IN_PROCESS).length,
        link: '/tracking', tone: 'info'},
      {icon: 'inventory_2', label: 'home.cards.ready',
        value: mine.filter(t => t.stage === OrderStage.READY_FOR_DELIVERY).length,
        link: '/tracking', tone: 'ok'},
      {icon: 'notifications_active', label: 'home.cards.unread-notifications',
        value: this.tracking.unreadCount(), link: '/tracking/notifications',
        tone: this.tracking.unreadCount() > 0 ? 'warn' : 'ok'}
    ];
  }
}
