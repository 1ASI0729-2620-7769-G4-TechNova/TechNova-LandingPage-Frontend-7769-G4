import {Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {DeliveryStore} from '../../../../delivery/application/delivery.store';
import {DeliveryStatus} from '../../../../delivery/domain/model/delivery-status';
import {TrackingStore} from '../../../application/tracking.store';

/**
 * Tracking timeline of a delivery, with the actions to move the delivery forward.
 */
@Component({
  selector: 'app-tracking-timeline',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './tracking-timeline.html',
  styleUrl: './tracking-timeline.css'
})
export class TrackingTimeline {
  protected readonly trackingStore = inject(TrackingStore);
  protected readonly deliveryStore = inject(DeliveryStore);

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly delivery = computed(() => this.deliveryStore.getDeliveryById(this.id));
  protected readonly nextStatus = computed(() => this.delivery()?.nextStatus() ?? null);
  protected readonly canFail = computed(() => this.delivery()?.status === DeliveryStatus.ON_THE_WAY);

  constructor() {
    this.deliveryStore.fetchDeliveries();
    this.trackingStore.fetchTracking(this.id);
  }
}
