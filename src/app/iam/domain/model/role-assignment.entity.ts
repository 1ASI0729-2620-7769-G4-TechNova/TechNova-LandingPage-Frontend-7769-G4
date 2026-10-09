import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {RoleAssignmentStatus} from './role-assignment-status';

/**
 * Links a user account with a role.
 */
export class RoleAssignment implements BaseEntity {
  /**
   * Creates a role assignment.
   * @param id - Identifier (0 when not persisted).
   * @param userId - Identifier of the user.
   * @param roleId - Identifier of the role.
   * @param assignedAt - ISO date of the assignment.
   * @param status - Assignment status.
   */
  constructor(
    public id: number,
    public userId: number,
    public roleId: number,
    public assignedAt: string,
    public status: RoleAssignmentStatus
  ) {}
}
