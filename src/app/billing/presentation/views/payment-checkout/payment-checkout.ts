import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {BillingStore} from '../../../application/billing.store';
import {Payment} from '../../../domain/model/payment.entity';
import {PaymentMethod} from '../../../domain/model/payment-method';
import {PaymentStatus} from '../../../domain/model/payment-status';

/** Amounts above this limit are rejected by the simulated payment gateway. */
const GATEWAY_LIMIT = 1000;

/**
 * Checkout form to pay an order digitally (US-016).
 */
@Component({
  selector: 'app-payment-checkout',
  imports: [ReactiveFormsModule, MatButtonModule, TranslatePipe],
  templateUrl: './payment-checkout.html',
  styleUrl: './payment-checkout.css'
})
export class PaymentCheckout extends BaseForm {
  protected readonly store = inject(BillingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly methods = Object.values(PaymentMethod);
  /** Translation key of the failure shown when the gateway rejects the payment. */
  protected readonly failure = signal<string>('');

  protected readonly form = this.fb.nonNullable.group({
    orderId: [Number(this.route.snapshot.queryParamMap.get('orderId')) || null as number | null,
      [Validators.required, Validators.min(1)]],
    customerName: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    paymentMethod: [PaymentMethod.CARD, Validators.required]
  });

  protected isInvalid(control: string): boolean {
    return this.isInvalidControl(this.form, control);
  }

  protected submit(): void {
    this.failure.set('');
    this.store.clearErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const amount = value.amount as number;
    // Simulated gateway: cash stays pending, digital methods are confirmed unless over the limit.
    const rejected = value.paymentMethod !== PaymentMethod.CASH && amount > GATEWAY_LIMIT;
    const status = rejected ? PaymentStatus.REJECTED
      : value.paymentMethod === PaymentMethod.CASH ? PaymentStatus.PENDING : PaymentStatus.CONFIRMED;
    const payment = new Payment(0, value.orderId as number, value.customerName, amount,
      value.paymentMethod, status, `PAY-${Date.now()}`, new Date().toISOString());
    this.store.registerPayment(payment, created => {
      if (created.status === PaymentStatus.REJECTED) {
        this.failure.set('billing.errors.rejected');
        return;
      }
      this.router.navigate(['/billing/payments', created.id]).then();
    });
  }
}
