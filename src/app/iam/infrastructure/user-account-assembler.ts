import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserStatus} from '../domain/model/user-status';
import {UserAccountResource, UserAccountsResponse} from './user-account-resource';

/**
 * Converts between {@link UserAccount} and its API representation.
 */
export class UserAccountAssembler
  implements BaseAssembler<UserAccount, UserAccountResource, UserAccountsResponse> {

  toEntityFromResource(resource: UserAccountResource): UserAccount {
    return new UserAccount(
      resource.id,
      resource.email,
      resource.firstName,
      resource.lastName,
      resource.status as UserStatus
    );
  }

  toResourceFromEntity(entity: UserAccount): UserAccountResource {
    return {
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      status: entity.status
    };
  }

  toEntitiesFromResponse(response: UserAccountsResponse): UserAccount[] {
    return response.users.map(resource => this.toEntityFromResource(resource));
  }
}
