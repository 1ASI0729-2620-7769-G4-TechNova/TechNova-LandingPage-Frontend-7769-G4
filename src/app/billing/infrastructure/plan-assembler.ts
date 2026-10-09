import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Plan} from '../domain/model/plan.entity';
import {PlanName} from '../domain/model/plan-name';
import {PlanResource, PlansResponse} from './plan-resource';

/**
 * Converts between {@link Plan} and its API representation.
 */
export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {

  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan(resource.id, resource.name as PlanName, resource.price, resource.currency,
      resource.features ?? []);
  }

  toResourceFromEntity(entity: Plan): PlanResource {
    return {id: entity.id, name: entity.name, price: entity.price, currency: entity.currency,
      features: entity.features};
  }

  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return response.plans.map(resource => this.toEntityFromResource(resource));
  }
}
