import {Routes} from '@angular/router';

const deliveryList = () => import('./views/delivery-list/delivery-list')
  .then(m => m.DeliveryList);
const deliverySchedule = () => import('./views/delivery-schedule/delivery-schedule')
  .then(m => m.DeliverySchedule);
const baseTitle = 'WashTrack';

/**
 * Routes of the Delivery bounded context, mounted under `/operations/deliveries`.
 */
export const deliveryRoutes: Routes = [
  {path: '', loadComponent: deliveryList, title: `${baseTitle} - Deliveries`},
  {path: 'new', loadComponent: deliverySchedule, title: `${baseTitle} - Schedule delivery`}
];
