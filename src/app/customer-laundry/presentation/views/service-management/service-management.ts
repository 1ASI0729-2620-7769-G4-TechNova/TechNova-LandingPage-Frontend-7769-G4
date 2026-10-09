import {Component, inject, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {CustomerLaundryStore} from '../../../application/customer-laundry.store';
import {LaundryService} from '../../../domain/model/laundry-service.entity';
import {ServiceUnit} from '../../../domain/model/service-unit';

/**
 * Catalog of the services a laundry offers: list, create, edit and enable or disable.
 */
@Component({
  selector: 'app-service-management',
  imports: [CurrencyPipe, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './service-management.html',
  styleUrl: './service-management.css'
})
export class ServiceManagement extends BaseForm {
  protected readonly store = inject(CustomerLaundryStore);
  private readonly fb = inject(FormBuilder);

  protected readonly columns = ['name', 'unit', 'price', 'status', 'actions'];
  protected readonly units = Object.values(ServiceUnit);
  /** Identifier of the service being edited; 0 while creating a new one. */
  protected readonly editingId = signal<number>(0);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    unit: [ServiceUnit.KILO, Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  constructor() {
    super();
    this.store.fetchServices();
  }

  protected isInvalid(control: string): boolean {
    return this.isInvalidControl(this.form, control);
  }

  protected edit(service: LaundryService): void {
    this.editingId.set(service.id);
    this.form.setValue({
      name: service.name,
      description: service.description,
      unit: service.unit,
      price: service.price
    });
  }

  protected reset(): void {
    this.editingId.set(0);
    this.form.reset({name: '', description: '', unit: ServiceUnit.KILO, price: null});
    this.store.clearErrors();
  }

  protected submit(): void {
    this.store.clearErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const current = this.store.services().find(service => service.id === this.editingId());
    this.store.saveService(new LaundryService(this.editingId(), value.name.trim(), value.description.trim(),
      value.unit, value.price as number, current?.active ?? true), () => this.reset());
  }
}
