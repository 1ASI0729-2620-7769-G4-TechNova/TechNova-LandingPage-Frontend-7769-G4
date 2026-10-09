import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Payment} from '../domain/model/payment.entity';
import {PaymentAssembler} from './payment-assembler';
import {PaymentResource, PaymentsResponse} from './payment-resource';

/** CRUD endpoint for payments. */
export class PaymentsApiEndpoint extends BaseApiEndpoint<
  Payment, PaymentResource, PaymentsResponse, PaymentAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/payments`, new PaymentAssembler());
  }
}
