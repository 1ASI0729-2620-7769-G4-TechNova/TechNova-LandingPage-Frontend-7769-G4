import {Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {DeliveryStore} from '../../../application/delivery.store';
import {DeliveryStatus} from '../../../domain/model/delivery-status';

/**
 * Detail of a delivery with its tracking timeline and the actions to move it forward.
 */
@Component({
  selector: 'app-delivery-tracking',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './delivery-tracking.html',
  styleUrl: './delivery-tracking.css'
})
export class DeliveryTracking {
  protected readonly store = inject(DeliveryStore);

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly delivery = computed(() => this.store.getDeliveryById(this.id));
  protected readonly nextStatus = computed(() => this.delivery()?.nextStatus() ?? null);
  protected readonly canFail = computed(() => this.delivery()?.status === DeliveryStatus.ON_THE_WAY);

  constructor() {
    this.store.fetchDeliveries();
    this.store.fetchTracking(this.id);
  }
}
