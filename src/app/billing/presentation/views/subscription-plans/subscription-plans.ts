import {Component, inject} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {BillingStore} from '../../../application/billing.store';
import {Plan} from '../../../domain/model/plan.entity';

/** Every feature a plan may enable, in display order. */
export const PLAN_FEATURES = ['orders', 'reports', 'digital-payments', 'advanced-history', 'delivery'];

/**
 * Compares the subscription plans and lets a laundry switch plan (US-008, US-017).
 */
@Component({
  selector: 'app-subscription-plans',
  imports: [CurrencyPipe, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './subscription-plans.html',
  styleUrl: './subscription-plans.css'
})
export class SubscriptionPlans {
  protected readonly store = inject(BillingStore);
  private readonly iam = inject(IamStore);
  private readonly translate = inject(TranslateService);

  protected readonly features = PLAN_FEATURES;

  constructor() {
    this.store.fetchPlans();
    const user = this.iam.currentUser();
    if (user) this.store.fetchSubscription(user.id);
  }

  protected isCurrent(plan: Plan): boolean {
    return this.store.subscription()?.planId === plan.id;
  }

  /** Asks for confirmation and moves the laundry to the chosen plan. */
  protected choose(plan: Plan): void {
    const user = this.iam.currentUser();
    if (!user) return;
    const message = this.translate.instant('subscriptions.plans.confirm-change',
      {plan: this.translate.instant('subscriptions.plan.' + plan.name)});
    if (confirm(message)) this.store.changePlan(user.id, plan.id);
  }
}
