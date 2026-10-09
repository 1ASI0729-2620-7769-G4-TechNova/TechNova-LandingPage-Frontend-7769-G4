import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * A role that groups a set of permissions (e.g. ADMIN, OPERATOR, DRIVER).
 */
export class Role implements BaseEntity {
  /**
   * Creates a role.
   * @param id - Identifier (0 when not persisted).
   * @param name - Role name.
   * @param permissions - Permissions granted by the role.
   */
  constructor(
    public id: number,
    public name: string,
    public permissions: string[]
  ) {}
}
