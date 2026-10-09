import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Payment} from '../domain/model/payment.entity';
import {PaymentStatus} from '../domain/model/payment-status';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PaymentsApiEndpoint, PlansApiEndpoint, SubscriptionsApiEndpoint} from './billing-api-endpoints';
import {SubscriptionAssembler} from './subscription-assembler';
import {SubscriptionResource} from './subscription-resource';

/**
 * Facade of the Billing bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class BillingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly paymentsEndpoint = new PaymentsApiEndpoint(this.http);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);
  private readonly subscriptionAssembler = new SubscriptionAssembler();

  /** Fetches every payment. */
  getPayments(): Observable<Payment[]> {
    return this.paymentsEndpoint.getAll();
  }

  /** Fetches one payment by identifier. */
  getPaymentById(id: number): Observable<Payment> {
    return this.paymentsEndpoint.getById(id);
  }

  /**
   * Registers a payment. Errors carry an i18n key as message.
   */
  registerPayment(payment: Payment): Observable<Payment> {
    if (!(payment.amount > 0)) {
      return throwError(() => new Error('billing.errors.invalid-amount'));
    }
    // The id is left undefined so json-server generates it (JSON drops undefined fields).
    return this.paymentsEndpoint.create({...payment, id: undefined as unknown as number});
  }

  /** Confirms a payment (status CONFIRMED). */
  confirmPayment(payment: Payment): Observable<Payment> {
    return this.paymentsEndpoint.update({...payment, status: PaymentStatus.CONFIRMED}, payment.id);
  }

  /** Fetches the available subscription plans. */
  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  /** Fetches the subscription of a laundry, or null when it has none. */
  getSubscriptionByLaundry(laundryId: number): Observable<Subscription | null> {
    return this.http.get<SubscriptionResource[]>(`${environment.apiBaseUrl}/subscriptions`,
      {params: {laundryId}}).pipe(
      map(list => list.length > 0 ? this.subscriptionAssembler.toEntityFromResource(list[0]) : null)
    );
  }

  /** Creates the subscription (id 0) or updates the existing one. */
  saveSubscription(subscription: Subscription): Observable<Subscription> {
    return subscription.id
      ? this.subscriptionsEndpoint.update(subscription, subscription.id)
      // The id is left undefined so json-server generates it.
      : this.subscriptionsEndpoint.create(new Subscription(undefined as unknown as number,
        subscription.laundryId, subscription.planId, subscription.status,
        subscription.startDate, subscription.endDate));
  }
}
