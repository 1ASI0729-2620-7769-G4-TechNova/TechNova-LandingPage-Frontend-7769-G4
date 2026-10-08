import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {UserAccount} from '../domain/model/user-account.entity';
import {Role} from '../domain/model/role.entity';
import {RoleAssignment} from '../domain/model/role-assignment.entity';
import {UserAccountAssembler} from './user-account-assembler';
import {RoleAssembler} from './role-assembler';
import {RoleAssignmentAssembler} from './role-assignment-assembler';
import {UserAccountResource, UserAccountsResponse} from './user-account-resource';
import {RoleAssignmentResource, RoleAssignmentsResponse, RoleResource, RolesResponse} from './role-resource';

/** CRUD endpoint for user accounts. */
export class UsersApiEndpoint extends BaseApiEndpoint<
  UserAccount, UserAccountResource, UserAccountsResponse, UserAccountAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/users`, new UserAccountAssembler());
  }
}

/** CRUD endpoint for roles. */
export class RolesApiEndpoint extends BaseApiEndpoint<Role, RoleResource, RolesResponse, RoleAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/roles`, new RoleAssembler());
  }
}

/** CRUD endpoint for role assignments. */
export class RoleAssignmentsApiEndpoint extends BaseApiEndpoint<
  RoleAssignment, RoleAssignmentResource, RoleAssignmentsResponse, RoleAssignmentAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/roleAssignments`, new RoleAssignmentAssembler());
  }
}
