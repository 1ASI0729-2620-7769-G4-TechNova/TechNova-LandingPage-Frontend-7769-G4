import {computed, inject, Injectable, signal} from '@angular/core';
import {BillingApi} from '../infrastructure/billing-api';
import {Payment} from '../domain/model/payment.entity';
import {PaymentStatus} from '../domain/model/payment-status';

/**
 * Application state of the Billing bounded context (payments).
 */
@Injectable({providedIn: 'root'})
export class BillingStore {
  private readonly api = inject(BillingApi);

  private readonly paymentsSignal = signal<Payment[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly loadedSignal = signal<boolean>(false);

  readonly payments = this.paymentsSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  /** Sum of the confirmed payments. */
  readonly totalConfirmed = computed(() =>
    this.paymentsSignal()
      .filter(payment => payment.status === PaymentStatus.CONFIRMED)
      .reduce((total, payment) => total + payment.amount, 0));

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
}
