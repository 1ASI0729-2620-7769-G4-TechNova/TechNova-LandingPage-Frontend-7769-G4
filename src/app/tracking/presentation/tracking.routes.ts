import {Routes} from '@angular/router';

const trackingList = () => import('./views/tracking-list/tracking-list')
  .then(m => m.TrackingList);
const notificationList = () => import('./views/notification-list/notification-list')
  .then(m => m.NotificationList);
const trackingDetail = () => import('./views/tracking-detail/tracking-detail')
  .then(m => m.TrackingDetail);
const baseTitle = 'WashTrack';

/**
 * Routes of the Tracking bounded context, mounted under `/tracking`.
 */
export const trackingRoutes: Routes = [
  {path: '', loadComponent: trackingList, title: `${baseTitle} - Tracking`},
  {path: 'notifications', loadComponent: notificationList, title: `${baseTitle} - Notifications`},
  {path: ':orderId', loadComponent: trackingDetail, title: `${baseTitle} - Order tracking`}
];
