import {Routes} from '@angular/router';

const orderReception = () => import('./views/order-reception/order-reception')
  .then(m => m.OrderReception);
const laundryProcessing = () => import('./views/laundry-processing/laundry-processing')
  .then(m => m.LaundryProcessing);
const baseTitle = 'WashTrack';

/**
 * Routes of the Laundry Operations bounded context, mounted under `/operations`.
 */
export const laundryOperationsRoutes: Routes = [
  {path: 'reception', loadComponent: orderReception, title: `${baseTitle} - Reception`},
  {path: 'laundry', loadComponent: laundryProcessing, title: `${baseTitle} - Laundry`}
];
