import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {AccountType} from '../../../domain/model/account-type';
import {AuthCard} from '../../components/auth-card/auth-card';
import {AccountTypeToggle} from '../../components/account-type-toggle/account-type-toggle';
import {PasswordField} from '../../components/password-field/password-field';
import {errorKeyFor} from '../../iam-validators';

/**
 * Sign-in form of the IAM bounded context.
 */
@Component({
  selector: 'app-sign-in-form',
  imports: [
    ReactiveFormsModule, MatIconModule, TranslatePipe,
    AuthCard, AccountTypeToggle, PasswordField
  ],
  templateUrl: './sign-in-form.html',
  styleUrl: '../../styles/auth-forms.css'
})
export class SignInForm extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** Account type selected in the toggle. */
  protected accountType = signal(AccountType.CLIENT);

  /** Success notice coming from sign-up or password recovery (`?notice=...`). */
  protected readonly notice: string | null =
    inject(ActivatedRoute).snapshot.queryParamMap.get('notice');

  /**
   * Reactive form with the credentials.
   */
  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    super();
    this.store.clearErrors();
  }

  /**
   * Translation key of the error of a control.
   */
  protected errorKey(controlName: 'email' | 'password'): string {
    return this.isInvalidControl(this.form, controlName)
      ? errorKeyFor(this.form.controls[controlName].errors) : '';
  }

  /**
   * Validates the form and signs the user in.
   */
  protected submitSignIn(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {email, password} = this.form.getRawValue();
    this.store.signIn(email, password, this.accountType(),
      () => this.router.navigate(['/home']).then());
  }

  /**
   * Navigates to the sign-up view.
   */
  protected navigateToSignUp(): void {
    this.router.navigate(['/sign-up']).then();
  }

  /**
   * Navigates to the password recovery view.
   */
  protected navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']).then();
  }
}
