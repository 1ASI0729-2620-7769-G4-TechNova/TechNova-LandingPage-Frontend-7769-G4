/**
 * Environment configuration of production builds. Development builds replace this file with
 * `environment.development.ts` (see angular.json).
 */
export const environment = {
  /**
   * Base URL of the fake REST API (json-server) deployed on Render.
   */
  apiBaseUrl: 'https://technova-backend-7769-g4.onrender.com/api/v1',

  /**
   * Laundry whose orders the dashboard lists (single-laundry demo).
   */
  laundryId: 1,

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
