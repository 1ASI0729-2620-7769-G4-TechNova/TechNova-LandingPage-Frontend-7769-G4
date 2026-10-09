import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Stage change as exchanged with the API.
 */
export interface StageChangeResource extends BaseResource {
  orderId: number;
  stage: string;
  changedAt: string;
}

/**
 * Response envelope for stage change collections.
 */
export interface StageChangesResponse extends BaseResponse {
  stageChanges: StageChangeResource[];
}
