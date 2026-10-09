import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {OrderTracking} from '../domain/model/order-tracking.entity';
import {StageChange} from '../domain/model/stage-change.entity';
import {Notification} from '../domain/model/notification.entity';
import {OrderTrackingAssembler} from './order-tracking-assembler';
import {StageChangeAssembler} from './stage-change-assembler';
import {NotificationAssembler} from './notification-assembler';
import {OrderTrackingResource, OrderTrackingsResponse} from './order-tracking-resource';
import {StageChangeResource, StageChangesResponse} from './stage-change-resource';
import {NotificationResource, NotificationsResponse} from './notification-resource';

/** CRUD endpoint for order trackings. */
export class OrderTrackingsApiEndpoint extends BaseApiEndpoint<
  OrderTracking, OrderTrackingResource, OrderTrackingsResponse, OrderTrackingAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/orderTrackings`, new OrderTrackingAssembler());
  }
}

/** CRUD endpoint for stage changes. */
export class StageChangesApiEndpoint extends BaseApiEndpoint<
  StageChange, StageChangeResource, StageChangesResponse, StageChangeAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/stageChanges`, new StageChangeAssembler());
  }
}

/** CRUD endpoint for notifications. */
export class NotificationsApiEndpoint extends BaseApiEndpoint<
  Notification, NotificationResource, NotificationsResponse, NotificationAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/notifications`, new NotificationAssembler());
  }
}
