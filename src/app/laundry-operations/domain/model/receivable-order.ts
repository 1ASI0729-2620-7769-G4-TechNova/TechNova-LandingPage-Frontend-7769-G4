/**
 * Confirmed order that reached the laundry and is waiting to be received.
 * Read model of what Laundry Operations needs from Order Management.
 */
export interface ReceivableOrder {
  orderId: number;
  orderNumber: string;
  customerId: number;
  garmentCount: number;
  createdAt: string;
}
