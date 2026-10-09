import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';
import {IamStore} from '../../../../iam/application/iam.store';

/**
 * A navigation entry of the sidebar. Entries with `children` behave as expandable groups.
 */
interface NavOption {
  link?: string;
  label: string;
  icon: string;
  children?: NavOption[];
  /** Only shown to users holding the ADMIN role. */
  adminOnly?: boolean;
  /** Only shown to laundry accounts. */
  laundryOnly?: boolean;
}

/**
 * Main shell component: sidebar navigation, top bar, routed content and footer.
 */
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    LanguageSwitcher,
    FooterContent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  /**
   * IAM store with the session of the signed-in user.
   */
  protected readonly store = inject(IamStore);

  private readonly router = inject(Router);

  /**
   * Navigation options shown in the sidebar.
   * Each bounded context adds its own entries here as it gets implemented.
   * Routes that are not implemented yet end up in the PageNotFound view.
   */
  options = signal<NavOption[]>([
    {link: '/home', label: 'option.home', icon: 'dashboard'},
    {link: '/orders', label: 'option.orders', icon: 'shopping_bag'},
    {
      label: 'option.operations', icon: 'tune', children: [
        {link: '/operations/pickup', label: 'option.pickup', icon: 'local_shipping'},
        {link: '/operations/reception', label: 'option.reception', icon: 'qr_code_scanner'},
        {link: '/operations/laundry', label: 'option.laundry', icon: 'water_drop'},
        {link: '/operations/deliveries', label: 'option.deliveries', icon: 'inventory_2'}
      ]
    },
    {
      label: 'option.management', icon: 'settings', children: [
        {link: '/management/services', label: 'option.services', icon: 'dry_cleaning'},
        {link: '/management/drivers', label: 'option.drivers', icon: 'two_wheeler'}
      ]
    },
    {
      label: 'option.billing', icon: 'payments', children: [
        {link: '/billing/payments', label: 'option.payments', icon: 'receipt_long'},
        {link: '/billing/checkout', label: 'option.checkout', icon: 'credit_card'}
      ]
    },
    {
      label: 'option.subscriptions', icon: 'workspace_premium', laundryOnly: true, children: [
        {link: '/billing/subscription', label: 'option.subscription', icon: 'event_available'},
        {link: '/billing/plans', label: 'option.plans', icon: 'sell'}
      ]
    },
    {link: '/iam/users', label: 'option.users', icon: 'group', adminOnly: true},
    {link: '/about', label: 'option.about', icon: 'info'}
  ]);

  /**
   * Navigation options visible to the signed-in user.
   */
  protected visibleOptions = computed(() =>
    this.options().filter(option =>
      (!option.adminOnly || this.store.isAdmin()) &&
      (!option.laundryOnly || this.store.currentUser()?.accountType === 'LAUNDRY')));

  /**
   * Labels of the groups that are currently expanded.
   */
  protected expandedGroups = signal<string[]>(['option.operations', 'option.management']);

  /**
   * Signed-in user displayed in the sidebar and top bar (provided by the IAM bounded context).
   */
  protected user = computed(() => ({
    name: this.store.currentUser()?.fullName ?? '',
    role: this.store.primaryRoleKey()
  }));

  /**
   * Signs the user out and goes to the sign-in view.
   */
  protected signOut(): void {
    this.store.signOut();
    this.router.navigate(['/sign-in']).then();
  }

  /**
   * Whether the given group is expanded.
   * @param label - The label of the group.
   */
  protected isExpanded(label: string): boolean {
    return this.expandedGroups().includes(label);
  }

  /**
   * Expands or collapses a group of the sidebar.
   * @param label - The label of the group.
   */
  protected toggleGroup(label: string): void {
    this.expandedGroups.update(groups =>
      groups.includes(label) ? groups.filter(g => g !== label) : [...groups, label]);
  }
}
