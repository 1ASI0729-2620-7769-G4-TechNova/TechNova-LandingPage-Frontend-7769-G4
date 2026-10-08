import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {IamApi} from '../infrastructure/iam-api';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserStatus} from '../domain/model/user-status';
import {Role} from '../domain/model/role.entity';
import {RoleAssignment} from '../domain/model/role-assignment.entity';
import {RoleAssignmentStatus} from '../domain/model/role-assignment-status';
import {SignUpResource} from '../infrastructure/user-account-resource';

const SESSION_KEY = 'washtrack.session';
const ADMIN_ROLE = 'ADMIN';

/**
 * Application state of the IAM bounded context (session, users, roles and assignments).
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly api = inject(IamApi);

  private readonly currentUserSignal = signal<UserAccount | null>(null);
  private readonly tokenSignal = signal<string>('');
  private readonly usersSignal = signal<UserAccount[]>([]);
  private readonly rolesSignal = signal<Role[]>([]);
  private readonly assignmentsSignal = signal<RoleAssignment[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly usersLoadedSignal = signal<boolean>(false);
  private readonly permissionsLoadedSignal = signal<boolean>(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly assignments = this.assignmentsSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly usersLoaded = this.usersLoadedSignal.asReadonly();
  /** True once roles and assignments of the session have been loaded (needed by guards). */
  readonly permissionsLoaded = this.permissionsLoadedSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null && this.tokenSignal() !== '');

  /** Translation key of the first role assigned to the signed-in user. */
  readonly primaryRoleKey = computed(() => {
    const user = this.currentUserSignal();
    const role = user ? this.rolesOfUser(user.id)[0] : undefined;
    return `iam.roles.${role ? role.name : 'NONE'}`;
  });

  constructor() {
    this.restoreSession();
  }

  /** Signs a user in and, on success, runs the optional callback. */
  signIn(email: string, password: string, onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.signIn(email, password).subscribe({
      next: user => {
        this.startSession(user, `fake-jwt-token-${user.id}`);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Registers a new account and, on success, runs the optional callback. */
  signUp(user: SignUpResource, onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.signUp(user).subscribe({
      next: created => {
        if (this.usersLoadedSignal()) this.usersSignal.update(users => [...users, created]);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  signOut(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set('');
    this.usersSignal.set([]);
    this.usersLoadedSignal.set(false);
    this.permissionsLoadedSignal.set(false);
    this.errorsSignal.set([]);
    localStorage.removeItem(SESSION_KEY);
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }

  fetchUsers(): void {
    this.api.getUsers().subscribe({
      next: users => {
        this.usersSignal.set(users);
        this.usersLoadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  fetchRoles(): void {
    this.api.getRoles().subscribe({
      next: roles => this.rolesSignal.set(roles),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  fetchAssignments(): void {
    this.api.getRoleAssignments().subscribe({
      next: assignments => this.assignmentsSignal.set(assignments),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  assignRole(userId: number, roleId: number): void {
    this.errorsSignal.set([]);
    this.api.assignRole(userId, roleId).subscribe({
      next: assignment => this.assignmentsSignal.update(list => [...list, assignment]),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  revokeRole(assignmentId: number): void {
    this.errorsSignal.set([]);
    this.api.revokeRole(assignmentId).subscribe({
      next: updated => this.assignmentsSignal.update(list =>
        list.map(a => a.id === updated.id ? updated : a)),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Updates basic data of a user; keeps the local state in sync. */
  updateUser(id: number, changes: {firstName: string; lastName: string; email: string; status: UserStatus},
             onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.updateUser(id, changes).subscribe({
      next: updated => {
        this.usersSignal.update(list => list.map(u => u.id === updated.id ? updated : u));
        if (this.currentUserSignal()?.id === updated.id) this.currentUserSignal.set(updated);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  deleteUser(id: number): void {
    this.errorsSignal.set([]);
    this.api.deleteUser(id).subscribe({
      next: () => this.usersSignal.update(list => list.filter(u => u.id !== id)),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Finds a user already loaded in the store. */
  getUserById(id: number): UserAccount | undefined {
    return this.usersSignal().find(u => u.id === id);
  }

  /** Active assignments (status ASSIGNED) of a user. */
  assignmentsOfUser(userId: number): RoleAssignment[] {
    return this.assignmentsSignal().filter(a =>
      a.userId === userId && a.status === RoleAssignmentStatus.ASSIGNED);
  }

  /** Roles currently assigned to a user. */
  rolesOfUser(userId: number): Role[] {
    const roles = this.rolesSignal();
    return this.assignmentsOfUser(userId)
      .map(a => roles.find(r => r.id === a.roleId))
      .filter((r): r is Role => r !== undefined);
  }

  /** Whether the signed-in user holds the ADMIN role. */
  isAdmin(): boolean {
    const user = this.currentUserSignal();
    return !!user && this.rolesOfUser(user.id).some(r => r.name === ADMIN_ROLE);
  }

  private startSession(user: UserAccount, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    localStorage.setItem(SESSION_KEY, JSON.stringify({user, token}));
    this.loadPermissions();
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const {user, token} = JSON.parse(raw);
      this.currentUserSignal.set(
        new UserAccount(user.id, user.email, user.firstName, user.lastName, user.status));
      this.tokenSignal.set(token);
      this.loadPermissions();
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  private loadPermissions(): void {
    this.permissionsLoadedSignal.set(false);
    let pending = 2;
    const done = () => { if (--pending === 0) this.permissionsLoadedSignal.set(true); };
    const load = <T>(source: Observable<T>, set: (v: T) => void) => source.subscribe({
      next: v => { set(v); done(); },
      error: (e: Error) => { this.errorsSignal.set([e.message]); done(); }
    });
    load(this.api.getRoles(), roles => this.rolesSignal.set(roles));
    load(this.api.getRoleAssignments(), list => this.assignmentsSignal.set(list));
  }
}
