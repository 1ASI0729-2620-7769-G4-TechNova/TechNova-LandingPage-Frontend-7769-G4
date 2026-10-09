/**
 * Environment configuration shared by the infrastructure layers.
 */
export const environment = {
  /**
   * Base URL of the fake REST API (json-server).
   */
  apiBaseUrl: 'http://localhost:3002',

  /**
   * Path of the orders collection of the order management bounded context.
   */
  ordersEndpointPath: '/orders',

  /**
   * Fee, in soles, charged when an order is delivered at the customer's home.
   */
  deliveryFee: 5,

  /**
   * ISO code of the currency used by every amount of the platform.
   */
  currencyCode: 'PEN',

  /**
   * Symbol shown before every amount.
   */
  currencySymbol: 'S/ '
};
