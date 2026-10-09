import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Payment} from '../domain/model/payment.entity';
import {PaymentMethod} from '../domain/model/payment-method';
import {PaymentStatus} from '../domain/model/payment-status';
import {PaymentResource, PaymentsResponse} from './payment-resource';

/**
 * Converts between {@link Payment} and its API representation.
 */
export class PaymentAssembler implements BaseAssembler<Payment, PaymentResource, PaymentsResponse> {

  toEntityFromResource(resource: PaymentResource): Payment {
    return new Payment(
      resource.id,
      resource.orderId,
      resource.customerName,
      resource.amount,
      resource.paymentMethod as PaymentMethod,
      resource.status as PaymentStatus,
      resource.reference,
      resource.paidAt
    );
  }

  toResourceFromEntity(entity: Payment): PaymentResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      customerName: entity.customerName,
      amount: entity.amount,
      paymentMethod: entity.paymentMethod,
      status: entity.status,
      reference: entity.reference,
      paidAt: entity.paidAt
    };
  }

  toEntitiesFromResponse(response: PaymentsResponse): Payment[] {
    return response.payments.map(resource => this.toEntityFromResource(resource));
  }
}
