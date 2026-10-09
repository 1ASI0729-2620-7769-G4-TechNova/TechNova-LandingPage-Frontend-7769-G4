import {computed, inject, Injectable, signal} from '@angular/core';
import {BillingApi} from '../infrastructure/billing-api';
import {Payment} from '../domain/model/payment.entity';
import {PaymentStatus} from '../domain/model/payment-status';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {SubscriptionStatus} from '../domain/model/subscription-status';

/** Length in days of one billing period. */
const PERIOD_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Application state of the Billing bounded context (payments).
 */
@Injectable({providedIn: 'root'})
export class BillingStore {
  private readonly api = inject(BillingApi);

  private readonly paymentsSignal = signal<Payment[]>([]);
  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionSignal = signal<Subscription | null>(null);
  private readonly subscriptionLoadedSignal = signal<boolean>(false);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly payments = this.paymentsSignal.asReadonly();
  readonly plans = this.plansSignal.asReadonly();
  readonly subscription = this.subscriptionSignal.asReadonly();
  readonly subscriptionLoaded = this.subscriptionLoadedSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  /** Sum of the confirmed payments. */
  readonly totalConfirmed = computed(() =>
    this.paymentsSignal()
      .filter(payment => payment.status === PaymentStatus.CONFIRMED)
      .reduce((total, payment) => total + payment.amount, 0));

  /** Plan of the current subscription. */
  readonly currentPlan = computed(() => {
    const subscription = this.subscriptionSignal();
    return subscription ? this.plansSignal().find(plan => plan.id === subscription.planId) : undefined;
  });

  fetchPayments(): void {
    this.api.getPayments().subscribe({
      next: payments => {
        this.paymentsSignal.set(payments);
        this.loadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Returns a loaded payment by identifier. */
  getPaymentById(id: number): Payment | undefined {
    return this.paymentsSignal().find(payment => payment.id === id);
  }

  /** Registers a payment and, on success, runs the optional callback with the stored payment. */
  registerPayment(payment: Payment, onSuccess?: (created: Payment) => void): void {
    this.errorsSignal.set([]);
    this.api.registerPayment(payment).subscribe({
      next: created => {
        this.paymentsSignal.update(payments => [...payments, created]);
        onSuccess?.(created);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Confirms a pending payment. */
  confirmPayment(id: number): void {
    const payment = this.getPaymentById(id);
    if (!payment) return;
    this.errorsSignal.set([]);
    this.api.confirmPayment(payment).subscribe({
      next: updated => this.paymentsSignal.update(payments =>
        payments.map(p => p.id === updated.id ? updated : p)),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }

  fetchPlans(): void {
    this.api.getPlans().subscribe({
      next: plans => this.plansSignal.set(plans),
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  fetchSubscription(laundryId: number): void {
    this.api.getSubscriptionByLaundry(laundryId).subscribe({
      next: subscription => {
        this.subscriptionSignal.set(subscription);
        this.subscriptionLoadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Moves the laundry to another plan for a new 30-day period (creates the subscription if missing). */
  changePlan(laundryId: number, planId: number, onSuccess?: () => void): void {
    const current = this.subscriptionSignal();
    this.saveSubscription(new Subscription(current?.id ?? 0, laundryId, planId,
      SubscriptionStatus.ACTIVE, new Date().toISOString(), this.endOfPeriodFrom(new Date())), onSuccess);
  }

  /** Renews the current plan: extends from the end date, or from today if it already expired. */
  renew(onSuccess?: () => void): void {
    const current = this.subscriptionSignal();
    if (!current) return;
    const base = current.isExpired() ? new Date() : new Date(current.endDate);
    this.saveSubscription(new Subscription(current.id, current.laundryId, current.planId,
      SubscriptionStatus.ACTIVE, current.startDate, this.endOfPeriodFrom(base)), onSuccess);
  }

  private saveSubscription(subscription: Subscription, onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.saveSubscription(subscription).subscribe({
      next: saved => {
        this.subscriptionSignal.set(saved);
        this.subscriptionLoadedSignal.set(true);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  private endOfPeriodFrom(base: Date): string {
    return new Date(base.getTime() + PERIOD_DAYS * DAY_MS).toISOString();
  }
}
