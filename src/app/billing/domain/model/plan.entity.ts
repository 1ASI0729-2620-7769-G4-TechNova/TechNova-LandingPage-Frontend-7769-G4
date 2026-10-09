import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {PlanName} from './plan-name';

/**
 * Subscription plan with its monthly price and enabled features.
 */
export class Plan implements BaseEntity {
  constructor(
    public id: number,
    public name: PlanName,
    public price: number,
    public currency: string,
    /** Feature codes enabled by the plan (translated under `subscriptions.features`). */
    public features: string[]
  ) {}

  hasFeature(feature: string): boolean {
    return this.features.includes(feature);
  }
}
