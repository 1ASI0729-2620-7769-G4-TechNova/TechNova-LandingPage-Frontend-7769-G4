import {Component, computed, inject, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {DeliveryStore} from '../../../application/delivery.store';
import {DeliveryStatus} from '../../../domain/model/delivery-status';
import {DeliveryType} from '../../../domain/model/delivery-type';

/**
 * Lists the pickups and deliveries filtered by status and type.
 */
@Component({
  selector: 'app-delivery-list',
  imports: [
    DatePipe, RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, TranslatePipe
  ],
  templateUrl: './delivery-list.html',
  styleUrl: './delivery-list.css'
})
export class DeliveryList {
  protected readonly store = inject(DeliveryStore);

  protected readonly columns = ['scheduledAt', 'order', 'customer', 'type', 'driver', 'status', 'actions'];
  protected readonly statuses = Object.values(DeliveryStatus);
  protected readonly types = Object.values(DeliveryType);

  protected readonly status = signal<string>('');
  protected readonly type = signal<string>('');

  /** Deliveries matching the selected status and type, closest schedule first. */
  protected readonly filtered = computed(() => {
    const status = this.status();
    const type = this.type();
    return this.store.deliveries()
      .filter(delivery => (!status || delivery.status === status) && (!type || delivery.type === type))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  });

  constructor() {
    this.store.fetchDeliveries();
  }

  protected clearFilters(): void {
    this.status.set('');
    this.type.set('');
  }
}
