/**
 * Represents the lifecycle states of an order.
 * The only valid flow is PENDING → CONFIRMED → COMPLETED.
 */
export enum OrderStatus {
  /**
   * The order was registered and is waiting for confirmation.
   */
  PENDING = 'PENDING',

  /**
   * The order was confirmed and its garments are being processed.
   */
  CONFIRMED = 'CONFIRMED',

  /**
   * The order was completed and returned to the customer.
   */
  COMPLETED = 'COMPLETED'
}
