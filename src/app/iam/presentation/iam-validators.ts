import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';

/** Minimum length required for new passwords. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Validators applied when a user creates or changes a password:
 * required, at least 8 characters, and at least one letter and one number.
 */
export const newPasswordValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(PASSWORD_MIN_LENGTH),
  Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
];

/**
 * Group validator: flags `mismatch` when two controls hold different values.
 * @param field - Name of the main control.
 * @param confirmField - Name of the confirmation control.
 */
export function matchFields(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(field)?.value;
    const b = group.get(confirmField)?.value;
    return a === b ? null : {mismatch: true};
  };
}

/**
 * Translation key for the first error of a control (empty when valid).
 * @param errors - Errors of the control.
 */
export function errorKeyFor(errors: ValidationErrors | null): string {
  if (!errors) return '';
  if (errors['required']) return 'iam.errors.required';
  if (errors['email']) return 'iam.errors.email';
  if (errors['minlength']) return 'iam.errors.password-length';
  if (errors['pattern']) return 'iam.errors.password-pattern';
  return 'iam.errors.invalid';
}
