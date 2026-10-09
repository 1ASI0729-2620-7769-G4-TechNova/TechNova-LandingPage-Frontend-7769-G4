import {Component, model} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {AccountType} from '../../../domain/model/account-type';

/**
 * Segmented control to choose between a client and a laundry account.
 */
@Component({
  selector: 'app-account-type-toggle',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './account-type-toggle.html',
  styleUrl: './account-type-toggle.css'
})
export class AccountTypeToggle {
  /** Selected account type (two-way bindable). */
  readonly value = model<AccountType>(AccountType.CLIENT);

  protected readonly options = [
    {value: AccountType.CLIENT, icon: 'person_outline', label: 'iam.account-type.CLIENT'},
    {value: AccountType.LAUNDRY, icon: 'storefront', label: 'iam.account-type.LAUNDRY'}
  ];
}
