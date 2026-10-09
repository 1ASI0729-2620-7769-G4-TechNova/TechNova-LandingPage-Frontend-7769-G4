import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Order} from '../domain/model/order.entity';
import {OrderAssembler} from './order.assembler';
import {OrderResource, OrdersResponse} from './order.resource';

/**
 * Endpoint client for order CRUD operations.
 */
export class OrdersApiEndpoint extends BaseApiEndpoint<Order, OrderResource, OrdersResponse, OrderAssembler> {
  /**
   * Creates an instance of OrdersApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}${environment.ordersEndpointPath}`, new OrderAssembler());
  }
}
