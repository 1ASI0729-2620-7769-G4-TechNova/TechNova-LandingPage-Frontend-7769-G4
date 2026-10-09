import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CurrencyPipe} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {OrderStore} from '../../../application/order.store';
import {DeliveryMethod} from '../../../domain/model/delivery-method';
import {Order} from '../../../domain/model/order.entity';
import {OrderStatus} from '../../../domain/model/order-status';
import {roundToCurrency} from '../../../domain/model/money';

/**
 * The pattern accepted by the fields that only allow whole numbers.
 */
const WHOLE_NUMBER_PATTERN = '^[0-9]+$';

/**
 * The smallest value of the fields that must be greater than zero.
 */
const MINIMUM_POSITIVE_VALUE = 1;

/**
 * The smallest value of the fields that cannot be negative.
 */
const MINIMUM_AMOUNT = 0;

/**
 * The number of garment entries the form always keeps.
 */
const MINIMUM_GARMENT_ENTRIES = 1;

/**
 * The placeholder identifier of an order that has not been stored yet; the API assigns the real one.
 */
const NEW_ORDER_ID = 0;

/**
 * The placeholder order number of an order that has not been stored yet; the API assigns the real one.
 */
const NEW_ORDER_NUMBER = '';

/**
 * The placeholder creation date of an order that has not been stored yet; the API assigns the real one.
 */
const NEW_ORDER_CREATED_AT = '';

/**
 * Creates orders with their garments.
 */
@Component({
  selector: 'app-order-form',
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css'
})
export class OrderForm extends BaseForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(OrderStore);
  private readonly router = inject(Router);

  /**
   * Signal indicating if the user has tried to submit, so store errors from other views are not shown.
   */
  private readonly submitted = signal<boolean>(false);

  /**
   * Form-group for the order form: customer, delivery method and a list of garments.
   */
  readonly orderForm = this.formBuilder.group({
    customerId: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(MINIMUM_POSITIVE_VALUE),
      Validators.pattern(WHOLE_NUMBER_PATTERN)
    ]),
    deliveryMethod: this.formBuilder.nonNullable.control(DeliveryMethod.HOME_DELIVERY, Validators.required),
    garments: this.formBuilder.array([this.createGarmentGroup()])
  });

  /**
   * Delivery methods the customer can choose from.
   */
  readonly deliveryMethods = Object.values(DeliveryMethod);

  /**
   * Signal indicating if the store is waiting for the API.
   */
  readonly loading = this.store.loading;

  /**
   * Computed signal for the i18n key of the store error, shown only after the user submits.
   */
  protected readonly error = computed(() => this.submitted() ? this.store.error() : null);

  /**
   * The number of garment entries the form always keeps.
   */
  protected readonly minimumGarmentEntries = MINIMUM_GARMENT_ENTRIES;

  /**
   * The currency used to display every amount.
   */
  protected readonly currencyCode = environment.currencyCode;

  /**
   * The symbol used to display every amount.
   */
  protected readonly currencySymbol = environment.currencySymbol;

  /**
   * Signal that emits every time any value of the form changes.
   */
  private readonly formValue = toSignal(this.orderForm.valueChanges, {
    initialValue: this.orderForm.getRawValue()
  });

  /**
   * Computed signal for the amounts of the order being filled in.
   * They are calculated with the same domain rules the store uses when it registers the order,
   * ignoring the garment entries that are not valid yet.
   * Reading the form value signal makes the summary recalculate every time the form changes.
   */
  protected readonly orderSummary = computed(() => {
    this.formValue();
    const order = this.buildOrder(true);
    const totalAmount = order.calculateTotalAmount(environment.deliveryFee);
    return {
      garmentCount: order.garmentCount,
      subtotal: order.subtotal,
      deliveryFee: roundToCurrency(totalAmount - order.subtotal),
      totalAmount
    };
  });

  /**
   * Gets the garment entries of the form.
   * @returns The form-array with one group per garment entry.
   */
  get garments() {
    return this.orderForm.controls.garments;
  }

  /**
   * Adds an empty garment entry to the form.
   */
  addGarment(): void {
    this.garments.push(this.createGarmentGroup());
  }

  /**
   * Removes a garment entry. The last remaining entry cannot be removed.
   * @param index - The position of the entry to remove.
   */
  removeGarment(index: number): void {
    if (this.garments.length > MINIMUM_GARMENT_ENTRIES) {
      this.garments.removeAt(index);
    }
  }

  /**
   * Submits the form to create the order.
   * When the form is invalid the validation messages are shown; when the order is stored, the user goes back to the list.
   */
  onSubmit(): void {
    this.submitted.set(true);
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.store.createOrder(this.buildOrder(false), () => this.router.navigate(['/orders']).then());
  }

  /**
   * Creates the group of controls of one garment entry.
   * @returns The form-group of the garment entry.
   */
  private createGarmentGroup() {
    return this.formBuilder.group({
      type: this.formBuilder.nonNullable.control('', Validators.required),
      color: this.formBuilder.nonNullable.control('', Validators.required),
      notes: this.formBuilder.nonNullable.control(''),
      quantity: this.formBuilder.control<number | null>(MINIMUM_POSITIVE_VALUE, [
        Validators.required,
        Validators.min(MINIMUM_POSITIVE_VALUE),
        Validators.pattern(WHOLE_NUMBER_PATTERN)
      ]),
      unitPrice: this.formBuilder.control<number | null>(null, [
        Validators.required,
        Validators.min(MINIMUM_AMOUNT)
      ])
    });
  }

  /**
   * Builds an order from the current values of the form.
   * @param onlyValidGarments - When true, garment entries that are still invalid are left out.
   * @returns A pending order whose garments were registered through the domain rules.
   */
  private buildOrder(onlyValidGarments: boolean): Order {
    const order = new Order({
      id: NEW_ORDER_ID,
      orderNumber: NEW_ORDER_NUMBER,
      customerId: Number(this.orderForm.controls.customerId.value),
      deliveryMethod: this.orderForm.controls.deliveryMethod.value,
      status: OrderStatus.PENDING,
      totalAmount: 0,
      createdAt: NEW_ORDER_CREATED_AT
    });
    this.garments.controls
      .filter(garmentGroup => !onlyValidGarments || garmentGroup.valid)
      .forEach(garmentGroup => {
        const garment = garmentGroup.getRawValue();
        order.registerGarment({
          type: garment.type,
          color: garment.color,
          notes: garment.notes,
          quantity: Number(garment.quantity),
          unitPrice: Number(garment.unitPrice)
        });
      });
    return order;
  }
}
