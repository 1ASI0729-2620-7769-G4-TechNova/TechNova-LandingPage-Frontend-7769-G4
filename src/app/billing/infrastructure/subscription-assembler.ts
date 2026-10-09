import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Subscription} from '../domain/model/subscription.entity';
import {SubscriptionStatus} from '../domain/model/subscription-status';
import {SubscriptionResource, SubscriptionsResponse} from './subscription-resource';

/**
 * Converts between {@link Subscription} and its API representation.
 */
export class SubscriptionAssembler
  implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {

  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription(resource.id, resource.laundryId, resource.planId,
      resource.status as SubscriptionStatus, resource.startDate, resource.endDate);
  }

  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {id: entity.id, laundryId: entity.laundryId, planId: entity.planId, status: entity.status,
      startDate: entity.startDate, endDate: entity.endDate};
  }

  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return response.subscriptions.map(resource => this.toEntityFromResource(resource));
  }
}
