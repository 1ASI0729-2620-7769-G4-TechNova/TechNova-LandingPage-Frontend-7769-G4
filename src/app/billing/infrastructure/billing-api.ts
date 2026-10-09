import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Payment} from '../domain/model/payment.entity';
import {PaymentStatus} from '../domain/model/payment-status';
import {PaymentsApiEndpoint} from './billing-api-endpoints';

/**
 * Facade of the Billing bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class BillingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly paymentsEndpoint = new PaymentsApiEndpoint(this.http);

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
}
