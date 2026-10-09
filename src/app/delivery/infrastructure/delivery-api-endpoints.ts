import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Delivery} from '../domain/model/delivery.entity';
import {DeliveryAssembler} from './delivery-assembler';
import {DeliveriesResponse, DeliveryResource} from './delivery-resource';

/** CRUD endpoint for deliveries. */
export class DeliveriesApiEndpoint extends BaseApiEndpoint<
  Delivery, DeliveryResource, DeliveriesResponse, DeliveryAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/deliveries`, new DeliveryAssembler());
  }
}
