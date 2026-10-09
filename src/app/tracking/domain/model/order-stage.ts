/**
 * Stages a laundry order goes through, in the order the customer sees them.
 */
export enum OrderStage {
  RECEIVED = 'RECEIVED',
  IN_PROCESS = 'IN_PROCESS',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED'
}

/** Stages in the order they are reached. */
export const ORDER_STAGES: readonly OrderStage[] = [
  OrderStage.RECEIVED,
  OrderStage.IN_PROCESS,
  OrderStage.READY_FOR_DELIVERY,
  OrderStage.DELIVERED
];
