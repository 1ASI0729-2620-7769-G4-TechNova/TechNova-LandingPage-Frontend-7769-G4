import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {UserAccount} from '../../../domain/model/user-account.entity';

/**
 * Lists the user accounts and lets an administrator create, edit or delete them.
 */
@Component({
  selector: 'app-user-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly columns = ['name', 'email', 'status', 'roles', 'actions'];

  constructor() {
    this.fetchUsers();
  }

  /**
   * Loads users, roles and assignments.
   */
  protected fetchUsers(): void {
    this.store.fetchUsers();
    this.store.fetchRoles();
    this.store.fetchAssignments();
  }

  /**
   * Navigates to the creation form.
   */
  protected navigateToNew(): void {
    this.router.navigate(['/iam/users/new']).then();
  }

  /**
   * Navigates to the edit form of a user.
   * @param id - User identifier.
   */
  protected navigateToEdit(id: number): void {
    this.router.navigate(['/iam/users', id]).then();
  }

  /**
   * Asks for confirmation and deletes the user.
   * @param user - The user to delete.
   */
  protected confirmDelete(user: UserAccount): void {
    const message = this.translate.instant('iam.users.confirm-delete', {name: user.fullName});
    if (confirm(message)) this.store.deleteUser(user.id);
  }
}
