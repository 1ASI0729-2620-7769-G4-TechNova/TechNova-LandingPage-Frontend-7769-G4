import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, switchMap, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {environment} from '../../../environments/environment';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserStatus} from '../domain/model/user-status';
import {AccountType} from '../domain/model/account-type';
import {Role} from '../domain/model/role.entity';
import {RoleAssignment} from '../domain/model/role-assignment.entity';
import {RoleAssignmentStatus} from '../domain/model/role-assignment-status';
import {RoleAssignmentsApiEndpoint, RolesApiEndpoint, UsersApiEndpoint} from './iam-api-endpoints';
import {UserAccountAssembler} from './user-account-assembler';
import {RoleAssignmentAssembler} from './role-assignment-assembler';
import {SignUpResource, UserAccountResource} from './user-account-resource';
import {RoleAssignmentResource} from './role-resource';

/**
 * Facade of the IAM bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiBaseUrl}/users`;
  private readonly assignmentsUrl = `${environment.apiBaseUrl}/roleAssignments`;
  private readonly userAssembler = new UserAccountAssembler();
  private readonly assignmentAssembler = new RoleAssignmentAssembler();

  private readonly usersEndpoint = new UsersApiEndpoint(this.http);
  private readonly rolesEndpoint = new RolesApiEndpoint(this.http);
  private readonly assignmentsEndpoint = new RoleAssignmentsApiEndpoint(this.http);

  /**
   * Authenticates a user. Errors carry an i18n key as message.
   */
  signIn(email: string, password: string, accountType: AccountType): Observable<UserAccount> {
    return this.http.get<UserAccountResource[]>(this.usersUrl, {params: {email, password}}).pipe(
      map(list => {
        if (list.length === 0) throw new Error('iam.errors.invalid-credentials');
        const user = this.userAssembler.toEntityFromResource(list[0]);
        if (user.status !== UserStatus.ACTIVE) throw new Error('iam.errors.account-disabled');
        if (user.accountType !== accountType) throw new Error('iam.errors.wrong-account-type');
        return user;
      })
    );
  }

  /**
   * Registers a new account (status ACTIVE). Fails if the email is already in use.
   */
  signUp(resource: SignUpResource): Observable<UserAccount> {
    return this.http.get<UserAccountResource[]>(this.usersUrl, {params: {email: resource.email}}).pipe(
      switchMap(existing => existing.length > 0
        ? throwError(() => new Error('iam.errors.email-taken'))
        : this.http.post<UserAccountResource>(this.usersUrl, {...resource, status: UserStatus.ACTIVE})),
      map(created => this.userAssembler.toEntityFromResource(created))
    );
  }

  /**
   * Changes the password of a user after verifying the current one.
   */
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.get<UserAccountResource>(`${this.usersUrl}/${userId}`).pipe(
      switchMap(user => {
        if (user.password !== currentPassword) {
          return throwError(() => new Error('iam.errors.current-password-wrong'));
        }
        if (currentPassword === newPassword) {
          return throwError(() => new Error('iam.errors.same-password'));
        }
        return this.http.patch<UserAccountResource>(`${this.usersUrl}/${userId}`, {password: newPassword});
      }),
      map(() => undefined)
    );
  }

  /**
   * Sets a new password for the account with the given email.
   * Simulated recovery: the fake backend has no email service, so no token is required.
   */
  resetPassword(email: string, newPassword: string): Observable<void> {
    return this.http.get<UserAccountResource[]>(this.usersUrl, {params: {email}}).pipe(
      switchMap(list => list.length === 0
        ? throwError(() => new Error('iam.errors.email-not-found'))
        : this.http.patch<UserAccountResource>(`${this.usersUrl}/${list[0].id}`, {password: newPassword})),
      map(() => undefined)
    );
  }

  getUsers(): Observable<UserAccount[]> {
    return this.usersEndpoint.getAll();
  }

  getUserById(id: number): Observable<UserAccount> {
    return this.usersEndpoint.getById(id);
  }

  /**
   * Partially updates a user (PATCH, so the stored password is preserved).
   */
  updateUser(id: number, changes: Partial<Omit<UserAccountResource, 'id'>>): Observable<UserAccount> {
    return this.http.patch<UserAccountResource>(`${this.usersUrl}/${id}`, changes).pipe(
      map(updated => this.userAssembler.toEntityFromResource(updated))
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.usersEndpoint.delete(id);
  }

  getRoles(): Observable<Role[]> {
    return this.rolesEndpoint.getAll();
  }

  getRoleAssignments(): Observable<RoleAssignment[]> {
    return this.assignmentsEndpoint.getAll();
  }

  assignRole(userId: number, roleId: number): Observable<RoleAssignment> {
    const assignment = new RoleAssignment(0, userId, roleId, new Date().toISOString(), RoleAssignmentStatus.ASSIGNED);
    return this.assignmentsEndpoint.create(assignment);
  }

  revokeRole(assignmentId: number): Observable<RoleAssignment> {
    return this.http.patch<RoleAssignmentResource>(`${this.assignmentsUrl}/${assignmentId}`,
      {status: RoleAssignmentStatus.REVOKE}).pipe(
      map(updated => this.assignmentAssembler.toEntityFromResource(updated))
    );
  }
}
