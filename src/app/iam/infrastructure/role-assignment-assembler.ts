import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {RoleAssignment} from '../domain/model/role-assignment.entity';
import {RoleAssignmentStatus} from '../domain/model/role-assignment-status';
import {RoleAssignmentResource, RoleAssignmentsResponse} from './role-resource';

/**
 * Converts between {@link RoleAssignment} and its API representation.
 */
export class RoleAssignmentAssembler
  implements BaseAssembler<RoleAssignment, RoleAssignmentResource, RoleAssignmentsResponse> {

  toEntityFromResource(resource: RoleAssignmentResource): RoleAssignment {
    return new RoleAssignment(
      resource.id,
      resource.userId,
      resource.roleId,
      resource.assignedAt,
      resource.status as RoleAssignmentStatus
    );
  }

  toResourceFromEntity(entity: RoleAssignment): RoleAssignmentResource {
    return {
      id: entity.id,
      userId: entity.userId,
      roleId: entity.roleId,
      assignedAt: entity.assignedAt,
      status: entity.status
    };
  }

  toEntitiesFromResponse(response: RoleAssignmentsResponse): RoleAssignment[] {
    return response.roleAssignments.map(resource => this.toEntityFromResource(resource));
  }
}
