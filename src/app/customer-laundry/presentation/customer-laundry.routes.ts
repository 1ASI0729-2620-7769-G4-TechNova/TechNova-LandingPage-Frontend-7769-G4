import {Routes} from '@angular/router';

const serviceManagement = () => import('./views/service-management/service-management')
  .then(m => m.ServiceManagement);
const driverManagement = () => import('./views/driver-management/driver-management')
  .then(m => m.DriverManagement);
const baseTitle = 'WashTrack';

/**
 * Routes of the Customer & Laundry Management bounded context, mounted under `/management`.
 */
export const customerLaundryRoutes: Routes = [
  {path: 'services', loadComponent: serviceManagement, title: `${baseTitle} - Services`},
  {path: 'drivers', loadComponent: driverManagement, title: `${baseTitle} - Drivers`}
];
