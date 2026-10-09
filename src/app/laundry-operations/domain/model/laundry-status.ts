/**
 * Stages of the processing of the garments of an order inside the laundry.
 */
export enum LaundryStatus {
  RECEIVED = 'RECEIVED',
  CLASSIFIED = 'CLASSIFIED',
  WASHING = 'WASHING',
  DRYING = 'DRYING',
  IRONING = 'IRONING',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY'
}

/** Statuses in the order they are reached. */
export const LAUNDRY_FLOW: readonly LaundryStatus[] = [
  LaundryStatus.RECEIVED,
  LaundryStatus.CLASSIFIED,
  LaundryStatus.WASHING,
  LaundryStatus.DRYING,
  LaundryStatus.IRONING,
  LaundryStatus.READY_FOR_DELIVERY
];
