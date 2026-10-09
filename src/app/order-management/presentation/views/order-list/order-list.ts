import {Component, computed, inject, signal} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {IamStore} from '../../../../iam/application/iam.store';
import {UserAccount} from '../../../../iam/domain/model/user-account.entity';
import {OrderStore} from '../../../application/order.store';
import {Order} from '../../../domain/model/order.entity';
import {OrderStatus} from '../../../domain/model/order-status';
import {OrderDetail, OrderDetailData} from '../order-detail/order-detail';

/**
 * The number of orders shown on each page of the list.
 */
const PAGE_SIZE = 6;

/**
 * The number of the first page of the list.
 */
const FIRST_PAGE = 1;

/**
 * The width of the order detail dialog.
 */
const DETAIL_DIALOG_WIDTH = '760px';

/**
 * The largest width of the order detail dialog, so it fits small screens.
 */
const DETAIL_DIALOG_MAX_WIDTH = '95vw';

/**
 * Displays the order collection with a search box, status filters and pagination.
 * The detail of each order opens in a dialog.
 */
@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList {
  private readonly store = inject(OrderStore);
  private readonly iamStore = inject(IamStore);
  private readonly dialog = inject(MatDialog);

  /**
   * Signal for the list of orders loaded from the API.
   */
  readonly orders = this.store.orders;

  /**
   * Signal indicating if the store is waiting for the API.
   */
  readonly loading = this.store.loading;

  /**
   * Signal for the i18n key of the current error, or null when there is none.
   */
  readonly error = this.store.error;

  /**
   * The statuses offered as filters.
   */
  protected readonly statuses = Object.values(OrderStatus);

  /**
   * The currency used to display every amount.
   */
  protected readonly currencyCode = environment.currencyCode;

  /**
   * The symbol used to display every amount.
   */
  protected readonly currencySymbol = environment.currencySymbol;

  /**
   * Signal for the text typed in the search box.
   */
  protected readonly searchText = signal<string>('');

  /**
   * Signal for the status chosen as filter, or null to show every status.
   */
  protected readonly selectedStatus = signal<OrderStatus | null>(null);

  /**
   * Signal for the page requested by the user.
   */
  protected readonly requestedPage = signal<number>(FIRST_PAGE);

  /**
   * Computed signal for the number of orders of each status, counting every order.
   */
  protected readonly statusCounts = computed(() => {
    const counts: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 0,
      [OrderStatus.COMPLETED]: 0
    };
    this.orders().forEach(order => counts[order.status]++);
    return counts;
  });

  /**
   * Computed signal for the orders that match the search and the selected status, newest first.
   */
  protected readonly filteredOrders = computed(() => {
    const status = this.selectedStatus();
    const searchText = this.searchText().trim().toLowerCase();
    return this.orders()
      .filter(order => (status === null || order.status === status) && this.matchesSearch(order, searchText))
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  });

  /**
   * Computed signal for the number of pages needed to show the filtered orders.
   */
  protected readonly totalPages = computed(() =>
    Math.max(FIRST_PAGE, Math.ceil(this.filteredOrders().length / PAGE_SIZE)));

  /**
   * Computed signal for the page that is being displayed, never beyond the last page.
   */
  protected readonly currentPage = computed(() => Math.min(this.requestedPage(), this.totalPages()));

  /**
   * Computed signal for the numbers of every page, used to build the pagination buttons.
   */
  protected readonly pageNumbers = computed(() =>
    Array.from({length: this.totalPages()}, (_, index) => index + FIRST_PAGE));

  /**
   * Computed signal for the orders of the page that is being displayed.
   */
  protected readonly visibleOrders = computed(() => {
    const firstIndex = (this.currentPage() - FIRST_PAGE) * PAGE_SIZE;
    return this.filteredOrders().slice(firstIndex, firstIndex + PAGE_SIZE);
  });

  /**
   * Creates an instance of OrderList and loads the customers, so their names can be displayed.
   */
  constructor() {
    this.iamStore.fetchUsers();
  }

  /**
   * Finds the customer that requested an order.
   * @param order - The order to look the customer up for.
   * @returns The customer, or undefined when the customer is not loaded.
   */
  protected customerOf(order: Order): UserAccount | undefined {
    return this.iamStore.getUserById(order.customerId);
  }

  /**
   * Applies the text typed in the search box and goes back to the first page.
   * @param text - The text to search for.
   */
  protected onSearch(text: string): void {
    this.searchText.set(text);
    this.requestedPage.set(FIRST_PAGE);
  }

  /**
   * Applies a status filter and goes back to the first page.
   * @param status - The status to show, or null to show every status.
   */
  protected selectStatus(status: OrderStatus | null): void {
    this.selectedStatus.set(status);
    this.requestedPage.set(FIRST_PAGE);
  }

  /**
   * Shows another page of the list.
   * @param page - The number of the page to show.
   */
  protected goToPage(page: number): void {
    this.requestedPage.set(Math.min(Math.max(page, FIRST_PAGE), this.totalPages()));
  }

  /**
   * Opens the detail dialog of an order.
   * @param order - The order to show.
   */
  protected openDetail(order: Order): void {
    const data: OrderDetailData = {orderId: order.id};
    this.dialog.open(OrderDetail, {
      data,
      width: DETAIL_DIALOG_WIDTH,
      maxWidth: DETAIL_DIALOG_MAX_WIDTH
    });
  }

  /**
   * Checks if an order matches the text typed in the search box.
   * The text is searched in the order number and in the name and email of the customer.
   * @param order - The order to check.
   * @param searchText - The lower case text to search for; an empty text matches every order.
   * @returns True when the order matches the search.
   */
  private matchesSearch(order: Order, searchText: string): boolean {
    if (searchText === '') {
      return true;
    }
    const customer = this.customerOf(order);
    const searchableTexts = [order.orderNumber, customer?.fullName ?? '', customer?.email ?? ''];
    return searchableTexts.some(text => text.toLowerCase().includes(searchText));
  }
}
