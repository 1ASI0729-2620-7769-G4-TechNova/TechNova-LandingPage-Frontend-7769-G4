import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Role} from '../domain/model/role.entity';
import {RoleResource, RolesResponse} from './role-resource';

/**
 * Converts between {@link Role} and its API representation.
 */
export class RoleAssembler implements BaseAssembler<Role, RoleResource, RolesResponse> {

  toEntityFromResource(resource: RoleResource): Role {
    return new Role(resource.id, resource.name, resource.permissions ?? []);
  }

  toResourceFromEntity(entity: Role): RoleResource {
    return {id: entity.id, name: entity.name, permissions: entity.permissions};
  }

  toEntitiesFromResponse(response: RolesResponse): Role[] {
    return response.roles.map(resource => this.toEntityFromResource(resource));
  }
}
