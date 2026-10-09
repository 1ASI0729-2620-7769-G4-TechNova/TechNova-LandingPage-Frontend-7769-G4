/**
 * Represents how the customer receives the processed garments.
 */
export enum DeliveryMethod {
  /**
   * The garments are delivered at the customer's home (the delivery fee applies).
   */
  HOME_DELIVERY = 'HOME_DELIVERY',

  /**
   * The customer picks up the garments at the store.
   */
  STORE_PICKUP = 'STORE_PICKUP'
}
