import {FormGroup} from '@angular/forms';

/**
 * Provides reusable validation helpers for reactive form components.
 * Every form view of any bounded context should extend this class.
 */
export abstract class BaseForm {
  /**
   * Checks if a form control is invalid and has been touched.
   * @param form - The form group containing the control.
   * @param controlName - The name of the control to check.
   * @returns True if the control is invalid and touched, false otherwise.
   */
  protected isInvalidControl(form: FormGroup, controlName: string): boolean {
    const control = form.controls[controlName];
    return control.invalid && control.touched;
  }

  /**
   * Builds the error message(s) of a form control.
   * @param form - The form group containing the control.
   * @param controlName - The name of the control.
   * @returns A concatenated string with the error messages, or an empty string if there are none.
   */
  protected errorMessageForControl(form: FormGroup, controlName: string): string {
    const errors = form.controls[controlName].errors;
    if (!errors) return '';
    return Object.keys(errors)
      .map((errorKey) => this.messageForError(controlName, errorKey))
      .join(' ');
  }

  /**
   * Maps an error key to a readable message.
   * @param controlName - The name of the control.
   * @param errorKey - The error key (e.g., 'required').
   */
  private messageForError(controlName: string, errorKey: string): string {
    switch (errorKey) {
      case 'required': return `The field ${controlName} is required.`;
      default: return `The field ${controlName} is invalid.`;
    }
  }
}
