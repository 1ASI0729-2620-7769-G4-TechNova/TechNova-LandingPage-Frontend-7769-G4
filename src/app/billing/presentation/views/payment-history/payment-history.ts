import {Component, computed, inject, signal} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {PaymentStatus} from '../../../domain/model/payment-status';

/**
 * Lists the payment history filtered by period and status.
 */
@Component({
  selector: 'app-payment-history',
  imports: [
    CurrencyPipe, DatePipe, RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, TranslatePipe
  ],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.css'
})
export class PaymentHistory {
  protected readonly store = inject(BillingStore);

  protected readonly columns = ['date', 'order', 'customer', 'amount', 'status', 'actions'];
  protected readonly statuses = Object.values(PaymentStatus);

  protected readonly from = signal<string>('');
  protected readonly to = signal<string>('');
  protected readonly status = signal<string>('');

  /** Payments matching the selected period (inclusive) and status. */
  protected readonly filtered = computed(() => {
    const from = this.from();
    const to = this.to();
    const status = this.status();
    return this.store.payments()
      .filter(payment => {
        const day = payment.paidAt.slice(0, 10);
        return (!from || day >= from) && (!to || day <= to) && (!status || payment.status === status);
      })
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  });

  constructor() {
    this.store.fetchPayments();
  }

  protected clearFilters(): void {
    this.from.set('');
    this.to.set('');
    this.status.set('');
  }
}
