import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {LaundryService} from '../domain/model/laundry-service.entity';
import {ServiceUnit} from '../domain/model/service-unit';
import {LaundryServiceResource, LaundryServicesResponse} from './laundry-service-resource';

/**
 * Converts between {@link LaundryService} and its API representation.
 */
export class LaundryServiceAssembler
  implements BaseAssembler<LaundryService, LaundryServiceResource, LaundryServicesResponse> {

  toEntityFromResource(resource: LaundryServiceResource): LaundryService {
    return new LaundryService(
      resource.id,
      resource.name,
      resource.description,
      resource.unit as ServiceUnit,
      resource.price,
      resource.active
    );
  }

  toResourceFromEntity(entity: LaundryService): LaundryServiceResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      unit: entity.unit,
      price: entity.price,
      active: entity.active
    };
  }

  toEntitiesFromResponse(response: LaundryServicesResponse): LaundryService[] {
    return response.laundryServices.map(resource => this.toEntityFromResource(resource));
  }
}
