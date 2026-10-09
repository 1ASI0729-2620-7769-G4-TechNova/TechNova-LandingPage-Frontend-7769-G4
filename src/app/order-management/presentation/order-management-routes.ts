import {Routes} from '@angular/router';

const orderList = () => import('./views/order-list/order-list')
  .then(m => m.OrderList);
const orderForm = () => import('./views/order-form/order-form')
  .then(m => m.OrderForm);
const baseTitle = 'WashTrack';

/**
 * Route tree for order management presentation views, mounted under `/orders`.
 */
export const orderManagementRoutes: Routes = [
  {path: '', loadComponent: orderList, title: `${baseTitle} - Orders`},
  {path: 'new', loadComponent: orderForm, title: `${baseTitle} - New order`}
];
