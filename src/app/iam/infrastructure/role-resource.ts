import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Role as exchanged with the API.
 */
export interface RoleResource extends BaseResource {
  name: string;
  permissions: string[];
}

/**
 * Response envelope for role collections.
 */
export interface RolesResponse extends BaseResponse {
  roles: RoleResource[];
}

/**
 * Role assignment as exchanged with the API.
 */
export interface RoleAssignmentResource extends BaseResource {
  userId: number;
  roleId: number;
  assignedAt: string;
  status: string;
}

/**
 * Response envelope for role assignment collections.
 */
export interface RoleAssignmentsResponse extends BaseResponse {
  roleAssignments: RoleAssignmentResource[];
}
