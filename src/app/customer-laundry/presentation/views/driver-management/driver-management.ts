import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {CustomerLaundryStore} from '../../../application/customer-laundry.store';
import {Driver} from '../../../domain/model/driver.entity';
import {DriverStatus} from '../../../domain/model/driver-status';

/**
 * Drivers of the laundry: list, create, edit and activate or deactivate.
 */
@Component({
  selector: 'app-driver-management',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './driver-management.html',
  styleUrl: './driver-management.css'
})
export class DriverManagement extends BaseForm {
  protected readonly store = inject(CustomerLaundryStore);
  private readonly fb = inject(FormBuilder);

  protected readonly columns = ['name', 'phone', 'vehicle', 'status', 'actions'];
  /** Identifier of the driver being edited; 0 while creating a new one. */
  protected readonly editingId = signal<number>(0);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    vehicle: ['']
  });

  constructor() {
    super();
    this.store.fetchDrivers();
  }

  protected isInvalid(control: string): boolean {
    return this.isInvalidControl(this.form, control);
  }

  protected edit(driver: Driver): void {
    this.editingId.set(driver.id);
    this.form.setValue({fullName: driver.fullName, phone: driver.phone, vehicle: driver.vehicle});
  }

  protected reset(): void {
    this.editingId.set(0);
    this.form.reset({fullName: '', phone: '', vehicle: ''});
    this.store.clearErrors();
  }

  protected submit(): void {
    this.store.clearErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const current = this.store.drivers().find(driver => driver.id === this.editingId());
    this.store.saveDriver(new Driver(this.editingId(), value.fullName.trim(), value.phone,
      value.vehicle.trim(), current?.status ?? DriverStatus.ACTIVE), () => this.reset());
  }
}
