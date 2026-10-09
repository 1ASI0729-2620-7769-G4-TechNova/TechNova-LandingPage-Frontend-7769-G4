import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DeliveryMethod} from './delivery-method';
import {Garment} from './garment.entity';
import {roundToCurrency} from './money';
import {OrderStatus} from './order-status';

/**
 * Represents the laundry order aggregate root in the order management domain model.
 * An order needs a customer and at least one garment to be registered, and garments can only be added while it is pending.
 * The total amount is the sum of the garment subtotals plus the delivery fee, which only applies to home delivery.
 * The status only moves PENDING → CONFIRMED → COMPLETED.
 * Business rule errors are thrown with an i18n key as message.
 */
export class Order implements BaseEntity {
  /**
   * The prefix of every generated order number.
   */
  static readonly ORDER_NUMBER_PREFIX = 'ORD';

  /**
   * The amount of digits of the sequential part of the order number.
   */
  static readonly ORDER_NUMBER_DIGITS = 6;

  /**
   * The unique identifier of the order.
   */
  #id: number;

  /**
   * The human readable code of the order, shown to the customer.
   */
  #orderNumber: string;

  /**
   * The identifier of the customer that requested the order.
   */
  #customerId: number;

  /**
   * How the garments are returned to the customer.
   */
  #deliveryMethod: DeliveryMethod;

  /**
   * The current lifecycle state of the order.
   */
  #status: OrderStatus;

  /**
   * The date and time (ISO 8601) in which the order was registered.
   */
  #createdAt: string;

  /**
   * The amount to be charged, calculated with {@link calculateTotalAmount}.
   */
  #totalAmount: number;

  /**
   * The garments registered in the order.
   */
  #garments: Garment[];

  /**
   * Creates a new order entity.
   * @param order - Initialization values.
   */
  constructor(order: {
    id: number;
    orderNumber: string;
    customerId: number;
    deliveryMethod: DeliveryMethod;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    garments?: Garment[];
  }) {
    this.#id = order.id;
    this.#orderNumber = order.orderNumber;
    this.#customerId = order.customerId;
    this.#deliveryMethod = order.deliveryMethod;
    this.#status = order.status;
    this.#totalAmount = order.totalAmount;
    this.#createdAt = order.createdAt;
    this.#garments = order.garments ? [...order.garments] : [];
  }

  /**
   * Builds the order number that corresponds to a sequence position.
   * @param sequence - Position of the order (1 for the first one).
   * @returns The order number, such as ORD-000001.
   */
  static buildOrderNumber(sequence: number): string {
    return `${Order.ORDER_NUMBER_PREFIX}-${String(sequence).padStart(Order.ORDER_NUMBER_DIGITS, '0')}`;
  }

  /**
   * Gets the order id.
   * @returns The unique identifier of the order.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Gets the order number.
   * @returns The human readable code of the order.
   */
  get orderNumber(): string {
    return this.#orderNumber;
  }

  /**
   * Gets the customer id.
   * @returns The identifier of the customer that requested the order.
   */
  get customerId(): number {
    return this.#customerId;
  }

  /**
   * Gets the delivery method.
   * @returns How the garments are returned to the customer.
   */
  get deliveryMethod(): DeliveryMethod {
    return this.#deliveryMethod;
  }

  /**
   * Gets the order status.
   * @returns The current lifecycle state of the order.
   */
  get status(): OrderStatus {
    return this.#status;
  }

  /**
   * Gets the total amount.
   * @returns The amount to be charged to the customer.
   */
  get totalAmount(): number {
    return this.#totalAmount;
  }

  /**
   * Gets the creation date.
   * @returns The date and time (ISO 8601) in which the order was registered.
   */
  get createdAt(): string {
    return this.#createdAt;
  }

  /**
   * Gets the garments of the order.
   * @returns A copy of the garments, so the list cannot be altered from outside.
   */
  get garments(): Garment[] {
    return [...this.#garments];
  }

  /**
   * Gets the subtotal of the order.
   * @returns The sum of the garment subtotals, without delivery fee.
   */
  get subtotal(): number {
    return roundToCurrency(this.#garments.reduce((sum, garment) => sum + garment.subtotal, 0));
  }

  /**
   * Gets the garment count.
   * @returns The total number of garments, counting every unit.
   */
  get garmentCount(): number {
    return this.#garments.reduce((sum, garment) => sum + garment.quantity, 0);
  }

  /**
   * Checks if the order is waiting for confirmation.
   * @returns True when the order is pending.
   */
  isPending(): boolean {
    return this.#status === OrderStatus.PENDING;
  }

  /**
   * Checks if the order has already been completed.
   * @returns True when the order is completed.
   */
  isCompleted(): boolean {
    return this.#status === OrderStatus.COMPLETED;
  }

  /**
   * Registers a garment in the order.
   * @param garment - Description of the garment to register.
   * @returns The garment that was added to the order.
   * @throws Error whose message is an i18n key when a business rule is broken.
   */
  registerGarment(garment: {
    type: string;
    color: string;
    notes: string;
    quantity: number;
    unitPrice: number;
  }): Garment {
    if (!this.isPending()) {
      throw new Error('order-management.errors.order-not-editable');
    }
    if (!Number.isInteger(garment.quantity) || garment.quantity <= 0) {
      throw new Error('order-management.errors.invalid-quantity');
    }
    if (!Number.isFinite(garment.unitPrice) || garment.unitPrice < 0) {
      throw new Error('order-management.errors.invalid-unit-price');
    }
    const registered = new Garment({
      id: this.#garments.length + 1,
      orderId: this.#id,
      type: garment.type,
      color: garment.color,
      notes: garment.notes,
      quantity: garment.quantity,
      unitPrice: garment.unitPrice
    });
    this.#garments.push(registered);
    return registered;
  }

  /**
   * Calculates and stores the total amount: garment subtotals plus the delivery fee,
   * which only applies to home delivery.
   * @param deliveryFee - Fee charged when the order is delivered at the customer's home.
   * @returns The calculated total amount.
   * @throws Error whose message is an i18n key when the fee is invalid.
   */
  calculateTotalAmount(deliveryFee: number): number {
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      throw new Error('order-management.errors.invalid-delivery-fee');
    }
    const appliedFee = this.#deliveryMethod === DeliveryMethod.HOME_DELIVERY ? deliveryFee : 0;
    this.#totalAmount = roundToCurrency(this.subtotal + appliedFee);
    return this.#totalAmount;
  }

  /**
   * Verifies the rules required to register the order.
   * @throws Error whose message is an i18n key when a business rule is broken.
   */
  assertCanBeRegistered(): void {
    if (!this.#customerId) {
      throw new Error('order-management.errors.customer-required');
    }
    if (this.#garments.length === 0) {
      throw new Error('order-management.errors.garments-required');
    }
  }

  /**
   * Confirms a pending order.
   * @returns A new order in CONFIRMED status; this instance is left untouched.
   * @throws Error whose message is an i18n key when the order is not pending.
   */
  confirm(): Order {
    if (this.#status !== OrderStatus.PENDING) {
      throw new Error('order-management.errors.cannot-confirm');
    }
    return this.copyWithStatus(OrderStatus.CONFIRMED);
  }

  /**
   * Completes a confirmed order.
   * @returns A new order in COMPLETED status; this instance is left untouched.
   * @throws Error whose message is an i18n key when the order is not confirmed.
   */
  complete(): Order {
    if (this.#status !== OrderStatus.CONFIRMED) {
      throw new Error('order-management.errors.cannot-complete');
    }
    return this.copyWithStatus(OrderStatus.COMPLETED);
  }

  /**
   * Copies the order with another status.
   * @param status - Status of the new order.
   * @returns A new order with the same data and the given status.
   */
  private copyWithStatus(status: OrderStatus): Order {
    return new Order({
      id: this.#id,
      orderNumber: this.#orderNumber,
      customerId: this.#customerId,
      deliveryMethod: this.#deliveryMethod,
      status,
      totalAmount: this.#totalAmount,
      createdAt: this.#createdAt,
      garments: this.#garments
    });
  }
}
