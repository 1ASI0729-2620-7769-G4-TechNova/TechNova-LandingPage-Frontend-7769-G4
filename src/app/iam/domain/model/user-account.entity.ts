import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {UserStatus} from './user-status';
import {AccountType} from './account-type';

/**
 * Aggregate root of the IAM bounded context: a person who can sign in.
 * An id of 0 means the account has not been persisted yet.
 */
export class UserAccount implements BaseEntity {
  /**
   * Creates a user account.
   * @param id - Identifier (0 when not persisted).
   * @param email - Email used to sign in.
   * @param firstName - First name.
   * @param lastName - Last name.
   * @param status - Account status.
   * @param accountType - Client or laundry account.
   * @param businessName - Name of the laundry (empty for clients).
   */
  constructor(
    public id: number,
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: UserStatus,
    public accountType: AccountType = AccountType.CLIENT,
    public businessName: string = ''
  ) {}

  /**
   * Full name of the user.
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
