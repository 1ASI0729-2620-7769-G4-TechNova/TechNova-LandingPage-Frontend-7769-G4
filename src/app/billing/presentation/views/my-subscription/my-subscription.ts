import {Component, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {BillingStore} from '../../../application/billing.store';

/**
 * Shows the plan contracted by the laundry and warns about its expiry (US-017).
 */
@Component({
  selector: 'app-my-subscription',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './my-subscription.html',
  styleUrl: './my-subscription.css'
})
export class MySubscription {
  protected readonly store = inject(BillingStore);
  private readonly iam = inject(IamStore);

  constructor() {
    this.store.fetchPlans();
    const user = this.iam.currentUser();
    if (user) this.store.fetchSubscription(user.id);
  }
}
