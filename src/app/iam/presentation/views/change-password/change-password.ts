import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {PasswordField} from '../../components/password-field/password-field';
import {matchFields, newPasswordValidators} from '../../iam-validators';

/**
 * Lets the signed-in user change their password.
 */
@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, TranslatePipe, PasswordField],
  templateUrl: './change-password.html',
  styleUrls: ['../../styles/auth-forms.css', './change-password.css']
})
export class ChangePassword {
  protected readonly store = inject(IamStore);
  private readonly fb = inject(FormBuilder);

  /** True after the password has been changed. */
  protected saved = signal(false);

  protected form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', newPasswordValidators],
    confirmPassword: ['', Validators.required]
  }, {validators: matchFields('newPassword', 'confirmPassword')});

  constructor() {
    this.store.clearErrors();
  }

  /**
   * Validates the form and changes the password.
   */
  protected submitChange(): void {
    this.saved.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {currentPassword, newPassword} = this.form.getRawValue();
    this.store.changePassword(currentPassword, newPassword, () => {
      this.form.reset();
      this.saved.set(true);
    });
  }
}
