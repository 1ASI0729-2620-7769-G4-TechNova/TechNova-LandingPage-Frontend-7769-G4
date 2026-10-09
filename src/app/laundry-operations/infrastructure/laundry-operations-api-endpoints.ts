import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {LaundryOrder} from '../domain/model/laundry-order.entity';
import {LaundryOrderAssembler} from './laundry-order-assembler';
import {LaundryOrderResource, LaundryOrdersResponse} from './laundry-order-resource';

/** CRUD endpoint for laundry orders. */
export class LaundryOrdersApiEndpoint extends BaseApiEndpoint<
  LaundryOrder, LaundryOrderResource, LaundryOrdersResponse, LaundryOrderAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/laundryOrders`, new LaundryOrderAssembler());
  }
}
