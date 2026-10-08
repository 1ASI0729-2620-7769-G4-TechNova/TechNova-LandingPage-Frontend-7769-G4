import {Component, computed, effect, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {UserAccount} from '../../../domain/model/user-account.entity';
import {UserStatus} from '../../../domain/model/user-status';
import {RoleAssignment} from '../../../domain/model/role-assignment.entity';

/**
 * Creates or edits a user account and manages its role assignments.
 */
@Component({
  selector: 'app-user-role-summary',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, TranslatePipe, DatePipe
  ],
  templateUrl: './user-role-summary.html',
  styleUrls: ['../../styles/iam-forms.css', './user-role-summary.css']
})
export class UserRoleSummary extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** Identifier in the route; null when creating a new user. */
  private readonly userId: number | null = this.parseId(this.route.snapshot.paramMap.get('id'));

  /** True when editing an existing user. */
  protected readonly isEdit = this.userId !== null;

  protected readonly statuses = Object.values(UserStatus);

  /** User being edited, resolved from the store. */
  protected readonly user = computed<UserAccount | undefined>(() =>
    this.userId === null ? undefined : this.store.getUserById(this.userId));

  /** Active assignments of the edited user. */
  protected readonly assignments = computed(() =>
    this.userId === null ? [] : this.store.assignmentsOfUser(this.userId));

  /** Roles that can still be assigned to the user. */
  protected readonly availableRoles = computed(() => {
    const assigned = this.assignments().map(a => a.roleId);
    return this.store.roles().filter(r => !assigned.includes(r.id));
  });

  protected form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
    status: [UserStatus.ACTIVE, Validators.required]
  });

  /** Role currently selected in the "assign role" control. */
  protected roleControl = new FormControl<number | null>(null);

  private patched = false;

  constructor() {
    super();
    this.store.clearErrors();
    this.store.fetchRoles();
    this.store.fetchAssignments();
    if (this.isEdit) {
      this.form.controls.password.disable();
      this.store.fetchUsers();
      effect(() => {
        const user = this.user();
        if (user && !this.patched) {
          this.patched = true;
          this.form.patchValue({
            firstName: user.firstName, lastName: user.lastName,
            email: user.email, status: user.status
          });
        }
      });
    }
  }

  /**
   * Returns the user data of the route.
   * @param id - User identifier.
   */
  protected getUserById(id: number): UserAccount | undefined {
    return this.store.getUserById(id);
  }

  /**
   * Saves the user: updates it when editing, registers it otherwise.
   */
  protected saveUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (this.userId !== null) {
      this.store.updateUser(this.userId, {
        firstName: value.firstName, lastName: value.lastName,
        email: value.email, status: value.status
      }, () => this.navigateBack());
    } else {
      this.store.signUp({
        firstName: value.firstName, lastName: value.lastName,
        email: value.email, password: value.password
      }, () => this.navigateBack());
    }
  }

  /**
   * Assigns the selected role to the edited user.
   */
  protected assignRole(): void {
    const roleId = this.roleControl.value;
    if (this.userId === null || roleId === null) return;
    this.store.assignRole(this.userId, roleId);
    this.roleControl.reset();
  }

  /**
   * Revokes a role assignment.
   * @param assignment - Assignment to revoke.
   */
  protected revokeRole(assignment: RoleAssignment): void {
    this.store.revokeRole(assignment.id);
  }

  /**
   * Name of the role of an assignment.
   * @param assignment - The assignment.
   */
  protected roleName(assignment: RoleAssignment): string {
    return this.store.roles().find(r => r.id === assignment.roleId)?.name ?? '';
  }

  /**
   * Goes back to the user list.
   */
  protected navigateBack(): void {
    this.router.navigate(['/iam/users']).then();
  }

  private parseId(raw: string | null): number | null {
    const id = raw === null ? NaN : Number(raw);
    return Number.isNaN(id) ? null : id;
  }
}
