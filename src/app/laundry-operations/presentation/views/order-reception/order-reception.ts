import {Component, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {LaundryOperationsStore} from '../../../application/laundry-operations.store';

/**
 * Confirmed orders waiting to be received by the laundry.
 */
@Component({
  selector: 'app-order-reception',
  imports: [DatePipe, MatTableModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './order-reception.html',
  styleUrl: './order-reception.css'
})
export class OrderReception {
  protected readonly store = inject(LaundryOperationsStore);

  protected readonly columns = ['order', 'garments', 'createdAt', 'actions'];

  constructor() {
    this.store.fetchLaundryOrders();
    this.store.fetchConfirmedOrders();
  }
}
