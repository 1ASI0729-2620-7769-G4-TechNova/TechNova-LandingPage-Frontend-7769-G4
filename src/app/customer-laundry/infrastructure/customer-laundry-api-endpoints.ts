import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {LaundryService} from '../domain/model/laundry-service.entity';
import {Driver} from '../domain/model/driver.entity';
import {LaundryServiceAssembler} from './laundry-service-assembler';
import {DriverAssembler} from './driver-assembler';
import {LaundryServiceResource, LaundryServicesResponse} from './laundry-service-resource';
import {DriverResource, DriversResponse} from './driver-resource';

/** CRUD endpoint for laundry services. */
export class LaundryServicesApiEndpoint extends BaseApiEndpoint<
  LaundryService, LaundryServiceResource, LaundryServicesResponse, LaundryServiceAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/laundryServices`, new LaundryServiceAssembler());
  }
}

/** CRUD endpoint for drivers. */
export class DriversApiEndpoint extends BaseApiEndpoint<
  Driver, DriverResource, DriversResponse, DriverAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/drivers`, new DriverAssembler());
  }
}
