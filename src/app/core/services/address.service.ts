import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Address } from '../../shared/models/app.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface AddressResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users/me/addresses`;
  private readonly addressesSubject = new BehaviorSubject<Address[]>([]);
  readonly addresses$ = this.addressesSubject.asObservable();

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.loadAddresses();
      } else {
        this.addressesSubject.next([]);
      }
    });
  }

  loadAddresses(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<AddressResponse>(this.apiUrl).pipe(
        map((res) => {
          if (res.success && Array.isArray(res.data)) {
            return res.data.map((addr) => this.mapBackendAddress(addr));
          }
          return [];
        }),
        catchError(() => of([]))
      ).subscribe((addrs) => {
        this.addressesSubject.next(addrs);
      });
    } else {
      this.addressesSubject.next([]);
    }
  }

  private mapBackendAddress(addr: any): Address {
    return {
      id: addr._id || addr.id,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      area: addr.area,
      addressLine: addr.addressLine,
      nearestLandmark: addr.nearestLandmark || '',
      latitude: addr.latitude ?? null,
      longitude: addr.longitude ?? null,
      isDefault: addr.isDefault || false,
    };
  }

  getAddresses() {
    this.loadAddresses();
    return this.addresses$;
  }

  getCurrentAddresses(): Address[] {
    return this.addressesSubject.value;
  }

  addAddress(address: Omit<Address, 'id'>) {
    const payload = {
      ...address,
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
    };
    return this.http.post<AddressResponse>(this.apiUrl, payload).pipe(
      tap(() => this.loadAddresses())
    );
  }

  updateAddress(updated: Address) {
    const payload = {
      ...updated,
      latitude: updated.latitude ?? null,
      longitude: updated.longitude ?? null,
    };
    return this.http.patch<AddressResponse>(`${this.apiUrl}/${updated.id}`, payload).pipe(
      tap(() => this.loadAddresses())
    );
  }

  deleteAddress(id: string) {
    return this.http.delete<AddressResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadAddresses())
    );
  }

  setDefaultAddress(id: string) {
    return this.http.patch<AddressResponse>(`${this.apiUrl}/${id}/default`, {}).pipe(
      tap(() => this.loadAddresses())
    );
  }

  getDefaultAddress(): Address | undefined {
    return this.addressesSubject.value.find((address) => address.isDefault);
  }
}
