import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Payment} from '../domain/model/payment.entity';
import {PaymentStatus} from '../domain/model/payment-status';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PaymentsApiEndpoint, PlansApiEndpoint, SubscriptionsApiEndpoint} from './billing-api-endpoints';
import {PaymentAssembler} from './payment-assembler';
import {PaymentResource} from './payment-resource';
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
  private readonly paymentAssembler = new PaymentAssembler();

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
    return this.http.post<PaymentResource>(`${environment.apiBaseUrl}/payments/${payment.id}/confirm`, {}).pipe(
      map(resource => this.paymentAssembler.toEntityFromResource(resource))
    );
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
    const base = `${environment.apiBaseUrl}/subscriptions`;
    const request = !subscription.id
      ? this.http.post<SubscriptionResource>(base, {laundryId: subscription.laundryId, planId: subscription.planId})
      : this.http.get<SubscriptionResource>(`${base}/${subscription.id}`).pipe(
        switchMap(current => current.planId !== subscription.planId
          ? this.http.post<SubscriptionResource>(`${base}/${subscription.id}/change-plan`, {planId: subscription.planId})
          : this.http.post<SubscriptionResource>(`${base}/${subscription.id}/renew`, {})));
    return request.pipe(map(resource => this.subscriptionAssembler.toEntityFromResource(resource)));
  }
}
