import {Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {TrackingStore} from '../../../application/tracking.store';

/**
 * Lists the stage of the orders: every order for a laundry, only their own for a customer.
 */
@Component({
  selector: 'app-tracking-list',
  imports: [DatePipe, RouterLink, MatTableModule, MatIconModule, TranslatePipe],
  templateUrl: './tracking-list.html',
  styleUrl: './tracking-list.css'
})
export class TrackingList {
  protected readonly store = inject(TrackingStore);
  private readonly iam = inject(IamStore);

  protected readonly columns = ['order', 'stage', 'updatedAt', 'actions'];

  protected readonly visible = computed(() => {
    const user = this.iam.currentUser();
    return this.store.trackings()
      .filter(tracking => user?.accountType === 'LAUNDRY' || tracking.customerId === user?.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  constructor() {
    this.store.fetchTrackings();
  }
}
