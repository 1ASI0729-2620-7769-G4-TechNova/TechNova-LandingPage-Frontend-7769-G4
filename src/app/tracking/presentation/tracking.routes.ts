import {Routes} from '@angular/router';

const trackingTimeline = () => import('./views/tracking-timeline/tracking-timeline')
  .then(m => m.TrackingTimeline);
const baseTitle = 'WashTrack';

/**
 * Routes of the Tracking bounded context, mounted under `/tracking`.
 */
export const trackingRoutes: Routes = [
  {path: ':id', loadComponent: trackingTimeline, title: `${baseTitle} - Tracking`}
];
