import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {toObservable} from '@angular/core/rxjs-interop';
import {filter, map, take} from 'rxjs';
import {IamStore} from './iam.store';

/**
 * Allows navigation only to authenticated users; otherwise redirects to sign-in.
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  return store.isAuthenticated() ? true : router.parseUrl('/sign-in');
};

/**
 * Allows navigation only to users holding the ADMIN role.
 * Waits until the roles of the session have been loaded.
 */
export const adminGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  if (!store.isAuthenticated()) return router.parseUrl('/sign-in');
  return toObservable(store.permissionsLoaded).pipe(
    filter(loaded => loaded),
    take(1),
    map(() => store.isAdmin() ? true : router.parseUrl('/home'))
  );
};
