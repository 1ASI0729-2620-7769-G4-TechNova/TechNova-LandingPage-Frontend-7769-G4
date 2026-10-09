import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {StageChange} from '../domain/model/stage-change.entity';
import {OrderStage} from '../domain/model/order-stage';
import {StageChangeResource, StageChangesResponse} from './stage-change-resource';

/**
 * Converts between {@link StageChange} and its API representation.
 */
export class StageChangeAssembler
  implements BaseAssembler<StageChange, StageChangeResource, StageChangesResponse> {

  toEntityFromResource(resource: StageChangeResource): StageChange {
    return new StageChange(resource.id, resource.orderId, resource.stage as OrderStage, resource.changedAt);
  }

  toResourceFromEntity(entity: StageChange): StageChangeResource {
    return {id: entity.id, orderId: entity.orderId, stage: entity.stage, changedAt: entity.changedAt};
  }

  toEntitiesFromResponse(response: StageChangesResponse): StageChange[] {
    return response.stageChanges.map(resource => this.toEntityFromResource(resource));
  }
}
