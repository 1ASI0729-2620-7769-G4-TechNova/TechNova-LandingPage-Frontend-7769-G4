import {Routes} from '@angular/router';

const paymentHistory = () => import('./views/payment-history/payment-history')
  .then(m => m.PaymentHistory);
const paymentCheckout = () => import('./views/payment-checkout/payment-checkout')
  .then(m => m.PaymentCheckout);
const paymentReceipt = () => import('./views/payment-receipt/payment-receipt')
  .then(m => m.PaymentReceipt);
const subscriptionPlans = () => import('./views/subscription-plans/subscription-plans')
  .then(m => m.SubscriptionPlans);
const mySubscription = () => import('./views/my-subscription/my-subscription')
  .then(m => m.MySubscription);
const baseTitle = 'WashTrack';

/**
 * Routes of the Billing bounded context, mounted under `/billing`.
 */
export const billingRoutes: Routes = [
  {path: 'payments', loadComponent: paymentHistory, title: `${baseTitle} - Payments`},
  {path: 'payments/:id', loadComponent: paymentReceipt, title: `${baseTitle} - Receipt`},
  {path: 'checkout', loadComponent: paymentCheckout, title: `${baseTitle} - Checkout`},
  {path: 'subscription', loadComponent: mySubscription, title: `${baseTitle} - My subscription`},
  {path: 'plans', loadComponent: subscriptionPlans, title: `${baseTitle} - Plans`}
];
