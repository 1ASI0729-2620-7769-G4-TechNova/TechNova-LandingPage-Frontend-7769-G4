import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';

/**
 * A navigation entry of the sidebar. Entries with `children` behave as expandable groups.
 */
interface NavOption {
  link?: string;
  label: string;
  icon: string;
  children?: NavOption[];
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
    {link: '/about', label: 'option.about', icon: 'info'}
  ]);

  /**
   * Labels of the groups that are currently expanded.
   */
  protected expandedGroups = signal<string[]>(['option.operations', 'option.management']);

  /**
   * Placeholder for the signed-in user. It will be replaced by the IAM bounded context.
   */
  protected user = signal({name: 'Pedro Fernández', role: 'user.role.operator'});

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
