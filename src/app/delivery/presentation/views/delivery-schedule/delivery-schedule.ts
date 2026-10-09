import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {DeliveryStore} from '../../../application/delivery.store';
import {Delivery} from '../../../domain/model/delivery.entity';
import {DeliveryStatus} from '../../../domain/model/delivery-status';
import {DeliveryType} from '../../../domain/model/delivery-type';

/**
 * Form to schedule a pickup or delivery of an order.
 */
@Component({
  selector: 'app-delivery-schedule',
  imports: [ReactiveFormsModule, MatButtonModule, TranslatePipe],
  templateUrl: './delivery-schedule.html',
  styleUrl: './delivery-schedule.css'
})
export class DeliverySchedule extends BaseForm {
  protected readonly store = inject(DeliveryStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly types = Object.values(DeliveryType);

  protected readonly form = this.fb.nonNullable.group({
    orderId: [Number(this.route.snapshot.queryParamMap.get('orderId')) || null as number | null,
      [Validators.required, Validators.min(1)]],
    customerName: ['', Validators.required],
    type: [DeliveryType.DELIVERY, Validators.required],
    address: ['', Validators.required],
    driverName: ['', Validators.required],
    scheduledAt: ['', Validators.required]
  });

  protected isInvalid(control: string): boolean {
    return this.isInvalidControl(this.form, control);
  }

  protected submit(): void {
    this.store.clearErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const delivery = new Delivery(0, value.orderId as number, value.customerName, value.type,
      value.address, value.driverName, new Date(value.scheduledAt).toISOString(),
      DeliveryStatus.SCHEDULED, '');
    this.store.scheduleDelivery(delivery, () =>
      this.router.navigate(['/operations/deliveries']).then());
  }
}
