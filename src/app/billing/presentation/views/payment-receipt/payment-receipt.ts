import {Component, computed, inject} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';

/**
 * Digital receipt of a registered payment.
 */
@Component({
  selector: 'app-payment-receipt',
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, TranslatePipe],
  templateUrl: './payment-receipt.html',
  styleUrl: './payment-receipt.css'
})
export class PaymentReceipt {
  protected readonly store = inject(BillingStore);

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly payment = computed(() => this.store.getPaymentById(this.id));

  constructor() {
    this.store.fetchPayments();
  }
}
