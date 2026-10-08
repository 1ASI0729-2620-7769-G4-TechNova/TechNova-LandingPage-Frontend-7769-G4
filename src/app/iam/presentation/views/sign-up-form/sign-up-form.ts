import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';

/**
 * Sign-up form of the IAM bounded context.
 */
@Component({
  selector: 'app-sign-up-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  templateUrl: './sign-up-form.html',
  styleUrl: '../../styles/iam-forms.css'
})
export class SignUpForm extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /**
   * Reactive form with the registration data.
   */
  protected form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    super();
    this.store.clearErrors();
  }

  /**
   * Validates the form, registers the account and goes to sign-in.
   */
  protected submitSignUp(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.signUp(this.form.getRawValue(), () => this.navigateToSignIn());
  }

  /**
   * Navigates to the sign-in view.
   */
  protected navigateToSignIn(): void {
    this.router.navigate(['/sign-in']).then();
  }
}
