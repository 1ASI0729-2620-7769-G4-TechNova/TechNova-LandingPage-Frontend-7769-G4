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
 * Sign-in form of the IAM bounded context.
 */
@Component({
  selector: 'app-sign-in-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  templateUrl: './sign-in-form.html',
  styleUrl: '../../styles/iam-forms.css'
})
export class SignInForm extends BaseForm {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

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
   * Validates the form and signs the user in.
   */
  protected submitSignIn(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {email, password} = this.form.getRawValue();
    this.store.signIn(email, password, () => this.router.navigate(['/home']).then());
  }

  /**
   * Navigates to the sign-up view.
   */
  protected navigateToSignUp(): void {
    this.router.navigate(['/sign-up']).then();
  }
}
