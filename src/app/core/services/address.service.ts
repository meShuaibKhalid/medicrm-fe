import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Address } from '../../shared/models/app.models';
import { MOCK_ADDRESSES } from '../../shared/data/mock-data';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly addressesSubject = new BehaviorSubject<Address[]>([...MOCK_ADDRESSES]);
  readonly addresses$ = this.addressesSubject.asObservable();

  getAddresses() {
    return this.addresses$;
  }

  getCurrentAddresses(): Address[] {
    return this.addressesSubject.value;
  }

  addAddress(address: Omit<Address, 'id'>) {
    const next = [...this.addressesSubject.value, { ...address, id: `addr-${Date.now()}` }];
    this.addressesSubject.next(this.normalizeDefault(next));
    return of(true);
  }

  updateAddress(updated: Address) {
    const next = this.addressesSubject.value.map((address) => address.id === updated.id ? updated : address);
    this.addressesSubject.next(this.normalizeDefault(next));
    return of(true);
  }

  deleteAddress(id: string) {
    const next = this.addressesSubject.value.filter((address) => address.id !== id);
    this.addressesSubject.next(this.normalizeDefault(next));
    return of(true);
  }

  setDefaultAddress(id: string) {
    const next = this.addressesSubject.value.map((address) => ({ ...address, isDefault: address.id === id }));
    this.addressesSubject.next(next);
    return of(true);
  }

  getDefaultAddress(): Address | undefined {
    return this.addressesSubject.value.find((address) => address.isDefault);
  }

  private normalizeDefault(addresses: Address[]): Address[] {
    if (!addresses.length) {
      return addresses;
    }

    if (!addresses.some((address) => address.isDefault)) {
      return addresses.map((address, index) => ({ ...address, isDefault: index === 0 }));
    }

    let defaultFound = false;
    return addresses.map((address) => {
      if (address.isDefault && !defaultFound) {
        defaultFound = true;
        return address;
      }
      return { ...address, isDefault: false };
    });
  }
}
