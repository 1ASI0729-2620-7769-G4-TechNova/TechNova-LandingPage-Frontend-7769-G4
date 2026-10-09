import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {AccountType} from '../../../domain/model/account-type';
import {AuthCard} from '../../components/auth-card/auth-card';
import {AccountTypeToggle} from '../../components/account-type-toggle/account-type-toggle';
import {PasswordField} from '../../components/password-field/password-field';
import {errorKeyFor, matchFields, newPasswordValidators} from '../../iam-validators';

/**
 * Sign-up form: creates a client or a laundry account with its own password.
 */
@Component({
  selector: 'app-sign-up-form',
  imports: [
    ReactiveFormsModule, MatIconModule, TranslatePipe,
    AuthCard, AccountTypeToggle, PasswordField
  ],
  templateUrl: './sign-up-form.html',
  styleUrl: '../../styles/auth-forms.css'
})
export class SignUpForm extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly AccountType = AccountType;

  /** Account type selected in the toggle. */
  protected accountType = signal(AccountType.CLIENT);

  /**
   * Reactive form with the registration data.
   * `businessName` is only required for laundry accounts.
   */
  protected form = this.fb.nonNullable.group({
    businessName: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', newPasswordValidators],
    confirmPassword: ['', Validators.required]
  }, {validators: matchFields('password', 'confirmPassword')});

  constructor() {
    super();
    this.store.clearErrors();
  }

  /**
   * Changes the account type and adjusts the validators of the business name.
   * @param type - Selected account type.
   */
  protected setAccountType(type: AccountType): void {
    this.accountType.set(type);
    const control = this.form.controls.businessName;
    if (type === AccountType.LAUNDRY) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
      control.reset('');
    }
    control.updateValueAndValidity();
  }

  /**
   * Translation key of the error of a text control.
   */
  protected errorKey(controlName: 'businessName' | 'firstName' | 'lastName' | 'email'): string {
    return this.isInvalidControl(this.form, controlName)
      ? errorKeyFor(this.form.controls[controlName].errors) : '';
  }

  /**
   * Validates the form, registers the account and goes to sign-in.
   */
  protected submitSignUp(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store.signUp({
      accountType: this.accountType(),
      businessName: this.accountType() === AccountType.LAUNDRY ? value.businessName : '',
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password
    }, () => this.router.navigate(['/sign-in'], {queryParams: {notice: 'registered'}}).then());
  }

  /**
   * Navigates to the sign-in view.
   */
  protected navigateToSignIn(): void {
    this.router.navigate(['/sign-in']).then();
  }
}
