import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AddressService } from '../../core/services/address.service';
import { Address } from '../../shared/models/app.models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Addresses</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-list class="soft-card">
          <ion-item *ngFor="let address of addressService.getCurrentAddresses()">
            <ion-label>
              <h2>{{ address.fullName }} <span *ngIf="address.isDefault">(Default)</span></h2>
              <p>{{ address.phone }} · {{ address.city }}, {{ address.area }}</p>
              <p>{{ address.addressLine }}</p>
              <p>{{ address.nearestLandmark }}</p>
              <div class="actions">
                <ion-button size="small" fill="clear" (click)="edit(address)">Edit</ion-button>
                <ion-button size="small" fill="clear" color="danger" (click)="addressService.deleteAddress(address.id).subscribe()">Delete</ion-button>
                <ion-button size="small" fill="clear" color="secondary" (click)="addressService.setDefaultAddress(address.id).subscribe()" *ngIf="!address.isDefault">Set Default</ion-button>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="section-title"><h3>{{ editingId ? 'Edit Address' : 'Add New Address' }}</h3></div>
        <div class="form-stack">
          <div class="map-placeholder soft-card">
            <div class="map-box">Map selector placeholder</div>
            <ion-button size="small" fill="outline" (click)="useCurrentLocation()">Use Current Location</ion-button>
          </div>
          <ion-item class="soft-card"><ion-label position="stacked">Full name</ion-label><ion-input [(ngModel)]="form.fullName"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Phone</ion-label><ion-input [(ngModel)]="form.phone"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">City</ion-label><ion-input [(ngModel)]="form.city"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Area</ion-label><ion-input [(ngModel)]="form.area"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Complete address</ion-label><ion-textarea [(ngModel)]="form.addressLine"></ion-textarea></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Nearest landmark</ion-label><ion-input [(ngModel)]="form.nearestLandmark"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Latitude</ion-label><ion-input type="number" [(ngModel)]="form.latitude"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Longitude</ion-label><ion-input type="number" [(ngModel)]="form.longitude"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-checkbox slot="start" [(ngModel)]="form.isDefault"></ion-checkbox><ion-label>Set as default</ion-label></ion-item>
          <ion-button expand="block" shape="round" (click)="save()">Save Address</ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .actions { display:flex; gap:8px; flex-wrap:wrap; margin-top: 8px; }
    .map-placeholder { padding: 16px; display:grid; gap:12px; }
    .map-box {
      min-height: 180px;
      border-radius: 14px;
      border: 1px dashed #c9cfde;
      display:grid;
      place-items:center;
      color:#7b8191;
      background: linear-gradient(180deg, #f9fbff, #f3f6fb);
    }
  `],
})
export class AddressesPage {
  readonly addressService = inject(AddressService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  editingId: string | null = null;
  form: Omit<Address, 'id'> = {
    fullName: '',
    phone: '',
    city: '',
    area: '',
    addressLine: '',
    nearestLandmark: '',
    latitude: null,
    longitude: null,
    isDefault: false,
  };

  edit(address: Address): void {
    this.editingId = address.id;
    this.form = {
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      area: address.area,
      addressLine: address.addressLine,
      nearestLandmark: address.nearestLandmark,
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      isDefault: address.isDefault,
    };
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.form.latitude = position.coords.latitude;
      this.form.longitude = position.coords.longitude;
    });
  }

  save(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    if (this.editingId) {
      this.addressService.updateAddress({ id: this.editingId, ...this.form }).subscribe(() => {
        if (redirectTo) {
          this.router.navigateByUrl(redirectTo);
        }
      });
    } else {
      this.addressService.addAddress(this.form).subscribe(() => {
        if (redirectTo) {
          this.router.navigateByUrl(redirectTo);
        }
      });
    }
    this.editingId = null;
    this.form = { fullName: '', phone: '', city: '', area: '', addressLine: '', nearestLandmark: '', latitude: null, longitude: null, isDefault: false };
  }
}
