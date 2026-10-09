import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Payment} from '../domain/model/payment.entity';
import {PaymentAssembler} from './payment-assembler';
import {PaymentResource, PaymentsResponse} from './payment-resource';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PlanAssembler} from './plan-assembler';
import {SubscriptionAssembler} from './subscription-assembler';
import {PlanResource, PlansResponse} from './plan-resource';
import {SubscriptionResource, SubscriptionsResponse} from './subscription-resource';

/** CRUD endpoint for payments. */
export class PaymentsApiEndpoint extends BaseApiEndpoint<
  Payment, PaymentResource, PaymentsResponse, PaymentAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/payments`, new PaymentAssembler());
  }
}

/** CRUD endpoint for subscription plans. */
export class PlansApiEndpoint extends BaseApiEndpoint<Plan, PlanResource, PlansResponse, PlanAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/plans`, new PlanAssembler());
  }
}

/** CRUD endpoint for laundry subscriptions. */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<
  Subscription, SubscriptionResource, SubscriptionsResponse, SubscriptionAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/subscriptions`, new SubscriptionAssembler());
  }
}
