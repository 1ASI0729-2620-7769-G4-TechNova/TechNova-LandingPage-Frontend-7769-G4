import {Component, computed, effect, input, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {errorKeyFor} from '../../iam-validators';

/**
 * Password input with show/hide toggle, optional strength meter and validation message.
 * Content projected with `label-action` is shown on the right of the label (e.g. a link).
 */
@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './password-field.html',
  styleUrl: './password-field.css'
})
export class PasswordField {
  /** Control holding the password. */
  readonly control = input.required<FormControl<string>>();
  /** Translation key of the label. */
  readonly label = input.required<string>();
  /** Value of the `autocomplete` attribute. */
  readonly autocomplete = input<string>('current-password');
  /** Whether to show the strength meter. */
  readonly showStrength = input<boolean>(false);
  /** Whether the group holding this field reports a mismatch (confirmation fields). */
  readonly mismatch = input<boolean>(false);

  protected readonly visible = signal(false);
  private readonly value = signal('');

  /** Strength from 0 (empty) to 4. */
  protected readonly strength = computed(() => {
    const v = this.value();
    if (!v) return 0;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return Math.max(score, 1);
  });

  protected readonly strengthLabel = computed(() =>
    ['', 'weak', 'weak', 'medium', 'strong'][this.strength()] || '');

  constructor() {
    effect(onCleanup => {
      const control = this.control();
      this.value.set(control.value);
      const sub = control.valueChanges.subscribe(v => this.value.set(v));
      onCleanup(() => sub.unsubscribe());
    });
  }

  /**
   * Translation key of the error to show, or an empty string.
   */
  protected errorKey(): string {
    const control = this.control();
    if (control.invalid && control.touched) return errorKeyFor(control.errors);
    if (this.mismatch() && control.touched) return 'iam.errors.mismatch';
    return '';
  }

  protected toggleVisibility(): void {
    this.visible.update(v => !v);
  }
}
