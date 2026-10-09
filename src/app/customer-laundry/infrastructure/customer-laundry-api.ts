import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {LaundryService} from '../domain/model/laundry-service.entity';
import {Driver} from '../domain/model/driver.entity';
import {DriversApiEndpoint, LaundryServicesApiEndpoint} from './customer-laundry-api-endpoints';

/**
 * Facade of the Customer & Laundry Management bounded context towards the REST API.
 */
@Injectable({providedIn: 'root'})
export class CustomerLaundryApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly servicesEndpoint = new LaundryServicesApiEndpoint(this.http);
  private readonly driversEndpoint = new DriversApiEndpoint(this.http);

  /** Fetches every laundry service. */
  getServices(): Observable<LaundryService[]> {
    return this.servicesEndpoint.getAll();
  }

  /**
   * Creates the service (id 0) or updates the existing one. Errors carry an i18n key as message.
   */
  saveService(service: LaundryService): Observable<LaundryService> {
    if (!service.name.trim()) {
      return throwError(() => new Error('customer-laundry.errors.name-required'));
    }
    if (!(service.price > 0)) {
      return throwError(() => new Error('customer-laundry.errors.invalid-price'));
    }
    // The id is left undefined so json-server generates it (JSON drops undefined fields).
    return service.id
      ? this.servicesEndpoint.update(service, service.id)
      : this.servicesEndpoint.create(new LaundryService(undefined as unknown as number, service.name,
        service.description, service.unit, service.price, service.active));
  }

  /** Fetches every driver. */
  getDrivers(): Observable<Driver[]> {
    return this.driversEndpoint.getAll();
  }

  /**
   * Creates the driver (id 0) or updates the existing one. Errors carry an i18n key as message.
   */
  saveDriver(driver: Driver): Observable<Driver> {
    if (!driver.fullName.trim()) {
      return throwError(() => new Error('customer-laundry.errors.name-required'));
    }
    if (!/^\d{9}$/.test(driver.phone)) {
      return throwError(() => new Error('customer-laundry.errors.invalid-phone'));
    }
    return driver.id
      ? this.driversEndpoint.update(driver, driver.id)
      : this.driversEndpoint.create(new Driver(undefined as unknown as number, driver.fullName,
        driver.phone, driver.vehicle, driver.status));
  }
}
