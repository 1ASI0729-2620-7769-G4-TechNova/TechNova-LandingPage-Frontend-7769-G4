import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';
import {adminGuard, authGuard} from './iam/application/iam.guards';
import {iamAdminRoutes, iamPublicRoutes} from './iam/presentation/iam.routes';

const about = () => import('./shared/presentation/views/about/about')
  .then(m => m.About);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found')
  .then(m => m.PageNotFound);
const baseTitle = 'WashTrack';

/**
 * Root route configuration. Each bounded context will add its own lazy-loaded routes here.
 */
export const routes: Routes = [
  ...iamPublicRoutes,
  {path: 'home',  component: Home,         canActivate: [authGuard], title: `${baseTitle} - Home`},
  {path: 'about', loadComponent: about,    canActivate: [authGuard], title: `${baseTitle} - About`},
  {path: 'iam',   canActivate: [adminGuard], children: iamAdminRoutes},
  {path: '',      redirectTo: '/home',     pathMatch: 'full'},
  {path: '**',    loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found`},
];
