import {Component, computed, inject, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {LaundryOperationsStore} from '../../../application/laundry-operations.store';
import {LAUNDRY_FLOW} from '../../../domain/model/laundry-status';

/**
 * Orders inside the laundry, filtered by stage, with the action to move them forward.
 */
@Component({
  selector: 'app-laundry-processing',
  imports: [DatePipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './laundry-processing.html',
  styleUrl: './laundry-processing.css'
})
export class LaundryProcessing {
  protected readonly store = inject(LaundryOperationsStore);

  protected readonly columns = ['order', 'garments', 'status', 'updatedAt', 'actions'];
  protected readonly statuses = LAUNDRY_FLOW;
  protected readonly status = signal<string>('');

  /** Orders matching the selected stage, oldest update first. */
  protected readonly filtered = computed(() => {
    const status = this.status();
    return this.store.laundryOrders()
      .filter(order => !status || order.status === status)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  });

  constructor() {
    this.store.fetchLaundryOrders();
  }
}
