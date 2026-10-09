import {computed, inject, Injectable, signal} from '@angular/core';
import {CustomerLaundryApi} from '../infrastructure/customer-laundry-api';
import {LaundryService} from '../domain/model/laundry-service.entity';
import {Driver} from '../domain/model/driver.entity';
import {DriverStatus} from '../domain/model/driver-status';

/**
 * Application state of the Customer & Laundry Management bounded context (services and drivers).
 */
@Injectable({providedIn: 'root'})
export class CustomerLaundryStore {
  private readonly api = inject(CustomerLaundryApi);

  private readonly servicesSignal = signal<LaundryService[]>([]);
  private readonly driversSignal = signal<Driver[]>([]);
  private readonly errorsSignal = signal<string[]>([]);
  private readonly servicesLoadedSignal = signal<boolean>(false);
  private readonly driversLoadedSignal = signal<boolean>(false);

  readonly services = this.servicesSignal.asReadonly();
  readonly drivers = this.driversSignal.asReadonly();
  readonly errors = this.errorsSignal.asReadonly();
  readonly servicesLoaded = this.servicesLoadedSignal.asReadonly();
  readonly driversLoaded = this.driversLoadedSignal.asReadonly();

  readonly activeDrivers = computed(() => this.driversSignal().filter(driver => driver.isActive()));

  fetchServices(): void {
    this.api.getServices().subscribe({
      next: services => {
        this.servicesSignal.set(services);
        this.servicesLoadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Creates or updates a service and, on success, runs the optional callback. */
  saveService(service: LaundryService, onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.saveService(service).subscribe({
      next: saved => {
        this.servicesSignal.update(services => service.id
          ? services.map(s => s.id === saved.id ? saved : s)
          : [...services, saved]);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Enables or disables a service. */
  toggleService(service: LaundryService): void {
    this.saveService(new LaundryService(service.id, service.name, service.description, service.unit,
      service.price, !service.active));
  }

  fetchDrivers(): void {
    this.api.getDrivers().subscribe({
      next: drivers => {
        this.driversSignal.set(drivers);
        this.driversLoadedSignal.set(true);
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Creates or updates a driver and, on success, runs the optional callback. */
  saveDriver(driver: Driver, onSuccess?: () => void): void {
    this.errorsSignal.set([]);
    this.api.saveDriver(driver).subscribe({
      next: saved => {
        this.driversSignal.update(drivers => driver.id
          ? drivers.map(d => d.id === saved.id ? saved : d)
          : [...drivers, saved]);
        onSuccess?.();
      },
      error: (e: Error) => this.errorsSignal.set([e.message])
    });
  }

  /** Activates or deactivates a driver. */
  toggleDriver(driver: Driver): void {
    this.saveDriver(new Driver(driver.id, driver.fullName, driver.phone, driver.vehicle,
      driver.isActive() ? DriverStatus.INACTIVE : DriverStatus.ACTIVE));
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }
}
