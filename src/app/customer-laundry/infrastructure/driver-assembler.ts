import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Driver} from '../domain/model/driver.entity';
import {DriverStatus} from '../domain/model/driver-status';
import {DriverResource, DriversResponse} from './driver-resource';

/**
 * Converts between {@link Driver} and its API representation.
 */
export class DriverAssembler implements BaseAssembler<Driver, DriverResource, DriversResponse> {

  toEntityFromResource(resource: DriverResource): Driver {
    return new Driver(resource.id, resource.fullName, resource.phone, resource.vehicle,
      resource.status as DriverStatus);
  }

  toResourceFromEntity(entity: Driver): DriverResource {
    return {
      id: entity.id,
      fullName: entity.fullName,
      phone: entity.phone,
      vehicle: entity.vehicle,
      status: entity.status
    };
  }

  toEntitiesFromResponse(response: DriversResponse): Driver[] {
    return response.drivers.map(resource => this.toEntityFromResource(resource));
  }
}
