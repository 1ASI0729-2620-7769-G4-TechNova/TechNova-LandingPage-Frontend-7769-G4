import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {AuthCard} from '../../components/auth-card/auth-card';
import {PasswordField} from '../../components/password-field/password-field';
import {errorKeyFor, matchFields, newPasswordValidators} from '../../iam-validators';

/**
 * Password recovery: sets a new password for an account identified by its email.
 * The fake backend has no email service, so the reset is done directly.
 */
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, MatIconModule, TranslatePipe, AuthCard, PasswordField],
  templateUrl: './forgot-password.html',
  styleUrl: '../../styles/auth-forms.css'
})
export class ForgotPassword extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', newPasswordValidators],
    confirmPassword: ['', Validators.required]
  }, {validators: matchFields('password', 'confirmPassword')});

  constructor() {
    super();
    this.store.clearErrors();
  }

  protected emailError(): string {
    return this.isInvalidControl(this.form, 'email')
      ? errorKeyFor(this.form.controls.email.errors) : '';
  }

  /**
   * Validates the form and resets the password.
   */
  protected submitReset(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {email, password} = this.form.getRawValue();
    this.store.resetPassword(email, password,
      () => this.router.navigate(['/sign-in'], {queryParams: {notice: 'password-reset'}}).then());
  }

  protected navigateToSignIn(): void {
    this.router.navigate(['/sign-in']).then();
  }
}
