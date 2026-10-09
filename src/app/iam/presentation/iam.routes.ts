import {Routes} from '@angular/router';
import {authGuard} from '../application/iam.guards';

const userList = () => import('./views/user-list/user-list').then(m => m.UserList);
const userRoleSummary = () => import('./views/user-role-summary/user-role-summary')
  .then(m => m.UserRoleSummary);
const signInForm = () => import('./views/sign-in-form/sign-in-form').then(m => m.SignInForm);
const signUpForm = () => import('./views/sign-up-form/sign-up-form').then(m => m.SignUpForm);
const forgotPassword = () => import('./views/forgot-password/forgot-password')
  .then(m => m.ForgotPassword);
const changePassword = () => import('./views/change-password/change-password')
  .then(m => m.ChangePassword);
const baseTitle = 'WashTrack';

/**
 * Public routes of the IAM bounded context (no session required).
 */
export const iamPublicRoutes: Routes = [
  {path: 'sign-in', loadComponent: signInForm, title: `${baseTitle} - Sign In`},
  {path: 'sign-up', loadComponent: signUpForm, title: `${baseTitle} - Sign Up`},
  {path: 'forgot-password', loadComponent: forgotPassword, title: `${baseTitle} - Forgot Password`}
];

/**
 * Account routes available to any signed-in user.
 */
export const iamAccountRoutes: Routes = [
  {path: 'change-password', loadComponent: changePassword, canActivate: [authGuard],
    title: `${baseTitle} - Change Password`}
];

/**
 * Administration routes of the IAM bounded context, mounted under `/iam` (ADMIN only).
 */
export const iamAdminRoutes: Routes = [
  {path: 'users', loadComponent: userList, title: `${baseTitle} - Users`},
  {path: 'users/new', loadComponent: userRoleSummary, title: `${baseTitle} - New User`},
  {path: 'users/:id', loadComponent: userRoleSummary, title: `${baseTitle} - Edit User`}
];
