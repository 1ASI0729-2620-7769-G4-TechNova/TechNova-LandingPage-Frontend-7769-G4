import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {SubscriptionStatus} from './subscription-status';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Days before the end date from which the owner is warned about the expiry. */
export const EXPIRY_WARNING_DAYS = 7;

/**
 * Plan contracted by a laundry (aggregate root of the Subscriptions side of the context).
 */
export class Subscription implements BaseEntity {
  constructor(
    public id: number,
    public laundryId: number,
    public planId: number,
    public status: SubscriptionStatus,
    public startDate: string,
    public endDate: string
  ) {}

  /** Whole days left until the end date (negative once expired). */
  daysToExpire(now: Date = new Date()): number {
    return Math.ceil((new Date(this.endDate).getTime() - now.getTime()) / DAY_MS);
  }

  isExpired(now: Date = new Date()): boolean {
    return this.status === SubscriptionStatus.EXPIRED || this.daysToExpire(now) < 0;
  }

  isExpiringSoon(now: Date = new Date()): boolean {
    return !this.isExpired(now) && this.daysToExpire(now) <= EXPIRY_WARNING_DAYS;
  }
}
