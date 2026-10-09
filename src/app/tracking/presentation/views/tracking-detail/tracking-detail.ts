import {Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {TrackingStore} from '../../../application/tracking.store';
import {ORDER_STAGES} from '../../../domain/model/order-stage';

/**
 * Stages of an order with the one reached so far and the date of each change.
 * Laundry accounts can move the order to its next stage, which notifies the customer.
 */
@Component({
  selector: 'app-tracking-detail',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './tracking-detail.html',
  styleUrl: './tracking-detail.css'
})
export class TrackingDetail {
  protected readonly store = inject(TrackingStore);
  private readonly iam = inject(IamStore);

  private readonly orderId = Number(inject(ActivatedRoute).snapshot.paramMap.get('orderId'));

  protected readonly stages = ORDER_STAGES;
  protected readonly tracking = computed(() => this.store.getTrackingByOrderId(this.orderId));
  protected readonly isLaundry = computed(() => this.iam.currentUser()?.accountType === 'LAUNDRY');
  protected readonly nextStage = computed(() => this.tracking()?.nextStage() ?? null);

  /** Date of the change in which the order reached the given stage, if it has. */
  protected readonly changedAt = computed(() => {
    const dates = new Map(this.store.stageChanges().map(change => [change.stage, change.changedAt]));
    return (stage: string) => dates.get(stage as never) ?? null;
  });

  constructor() {
    this.store.fetchTrackings();
    this.store.fetchStageChanges(this.orderId);
  }
}
