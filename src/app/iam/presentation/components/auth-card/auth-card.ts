import {Component, input} from '@angular/core';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

/**
 * Centered card shared by the authentication views (title, subtitle and projected content).
 */
@Component({
  selector: 'app-auth-card',
  imports: [LanguageSwitcher],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css'
})
export class AuthCard {
  /** Already translated title. */
  readonly title = input.required<string>();
  /** Already translated subtitle. */
  readonly subtitle = input<string>('');
  /** Maximum width of the card in pixels. */
  readonly maxWidth = input<number>(420);
}
