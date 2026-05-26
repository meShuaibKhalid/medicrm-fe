import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { AddressService } from '../../core/services/address.service';
import { Address } from '../../shared/models/app.models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="header-title">Addresses</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-container">
        
        <div class="address-list" *ngIf="addressService.getCurrentAddresses().length > 0">
          <div class="address-card" *ngFor="let address of addressService.getCurrentAddresses()">
            <div class="address-header">
              <div class="address-title">
                <ion-icon name="location" class="location-icon"></ion-icon>
                <h3>{{ address.fullName }}</h3>
              </div>
              <span class="default-badge" *ngIf="address.isDefault">Default</span>
            </div>
            <div class="address-body">
              <p class="phone">{{ address.phone }}</p>
              <p class="address-text">{{ address.addressLine }}<br>{{ address.area }}, {{ address.city }}</p>
              <p class="landmark" *ngIf="address.nearestLandmark">Landmark: {{ address.nearestLandmark }}</p>
            </div>
            <div class="actions">
              <button class="btn-action edit" (click)="edit(address)">Edit</button>
              <button class="btn-action delete" (click)="addressService.deleteAddress(address.id).subscribe()">Delete</button>
              <button class="btn-action set-default" (click)="addressService.setDefaultAddress(address.id).subscribe()" *ngIf="!address.isDefault">Set Default</button>
            </div>
          </div>
        </div>

        <div class="form-container">
          <div class="section-title">
            <h3>{{ editingId ? 'Edit Address' : 'Add New Address' }}</h3>
          </div>
          
          <div class="form-stack">
            <div class="map-placeholder">
              <div class="map-box">
                <ion-icon name="map-outline" style="font-size: 32px; color: #b05070; margin-bottom: 8px;"></ion-icon>
                Pinpoint location on map
              </div>
              <button class="btn-secondary" (click)="useCurrentLocation()">
                <ion-icon name="locate-outline"></ion-icon> Use Current Location
              </button>
            </div>
            
            <input class="field" type="text" placeholder="Full name*" [(ngModel)]="form.fullName" />
            <input class="field" type="tel" placeholder="Phone number*" [(ngModel)]="form.phone" />
            <input class="field" type="text" placeholder="City*" [(ngModel)]="form.city" />
            <input class="field" type="text" placeholder="Area / Locality*" [(ngModel)]="form.area" />
            <textarea class="field textarea" placeholder="Complete address*" [(ngModel)]="form.addressLine" rows="3"></textarea>
            <input class="field" type="text" placeholder="Nearest landmark (optional)" [(ngModel)]="form.nearestLandmark" />
            
            <div class="row-fields">
              <input class="field" type="number" placeholder="Latitude*" [(ngModel)]="form.latitude" />
              <input class="field" type="number" placeholder="Longitude*" [(ngModel)]="form.longitude" />
            </div>

            <div class="checkbox-row">
              <ion-checkbox [(ngModel)]="form.isDefault"></ion-checkbox>
              <span class="checkbox-label">Set as default address</span>
            </div>

            <button class="btn-primary" (click)="save()">Save Address</button>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    :host { --ion-background-color: var(--color-ice-blue); }

    .header-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      color: var(--color-navy-black);
    }

    .page-container {
      padding: 1rem;
      font-family: 'Poppins', sans-serif;
      max-width: 700px;
      margin: 0 auto;
    }

    /* List Styles */
    .address-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .address-card {
      background: var(--color-white-near-white);
      border-radius: var(--app-border-radius-large, 18px);
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      border: 1px solid var(--color-soft-blue-gray);
      transition: box-shadow 0.2s;
    }

    .address-card:hover {
      box-shadow: 0 8px 24px rgba(14,168,125,0.08);
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .address-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .location-icon {
      color: var(--ion-color-primary);
      font-size: 20px;
    }

    .address-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--color-navy-black);
    }

    .default-badge {
      background: var(--color-pale-mint);
      color: var(--ion-color-primary);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: var(--app-border-radius-small, 8px);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .address-body p {
      margin: 0 0 0.4rem;
      font-size: 14px;
      color: var(--color-slate-gray);
      line-height: 1.4;
    }

    .address-body .phone {
      font-weight: 600;
      color: var(--color-navy-black);
    }

    .address-body .landmark {
      font-size: 13px;
      color: var(--color-blue-gray);
      font-style: italic;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--color-soft-blue-gray);
    }

    .btn-action {
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--app-border-radius-small, 8px);
      transition: background 0.2s;
    }

    .btn-action.edit { color: var(--ion-color-primary); background: var(--color-pale-mint); }
    .btn-action.edit:hover { background: var(--color-soft-blue-gray); }
    
    .btn-action.delete { color: var(--ion-color-danger); background: #ffeeee; }
    .btn-action.delete:hover { background: #ffdddd; }

    .btn-action.set-default { color: var(--ion-color-secondary); background: #f0f7ff; margin-left: auto; }
    .btn-action.set-default:hover { background: #ddecff; }


    /* Form Styles */
    .form-container {
      background: var(--color-white-near-white);
      border-radius: var(--app-border-radius-large, 18px);
      padding: 1.5rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.03);
      border: 1px solid var(--color-soft-blue-gray);
    }

    .section-title h3 {
      margin: 0 0 1.5rem;
      font-size: 18px;
      font-weight: 700;
      color: var(--color-navy-black);
    }

    .form-stack {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .row-fields {
      display: flex;
      gap: 0.85rem;
    }
    .row-fields .field {
      flex: 1;
    }

    .field {
      width: 100%;
      border: 1.5px solid var(--color-soft-blue-gray);
      border-radius: var(--app-border-radius, 12px);
      padding: 0.8rem 1rem;
      font-size: 14px;
      color: var(--color-navy-black);
      background: var(--color-white-near-white);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .field.textarea {
      resize: vertical;
      font-family: inherit;
    }

    .field::placeholder { color: var(--color-blue-gray); }
    .field:focus {
      border-color: var(--ion-color-primary);
      box-shadow: 0 0 0 3px rgba(14,168,125,0.10);
      background: var(--color-white-near-white);
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 0.5rem;
    }

    .checkbox-label {
      font-size: 14px;
      color: var(--color-slate-gray);
    }

    /* Map Box */
    .map-placeholder {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 0.5rem;
    }
    
    .map-box {
      height: 140px;
      border-radius: var(--app-border-radius, 12px);
      border: 1.5px dashed var(--ion-color-primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--ion-color-primary);
      font-size: 13px;
      font-weight: 600;
      background: var(--color-pale-mint);
    }

    .btn-secondary {
      width: 100%;
      padding: 0.8rem;
      background: var(--color-white-near-white);
      color: var(--color-navy-black);
      border: 1.5px solid var(--color-soft-blue-gray);
      border-radius: var(--app-border-radius, 12px);
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
    }

    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: var(--ion-color-primary);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.05em;
      border: none;
      border-radius: var(--app-border-radius, 12px);
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: var(--color-fresh-green); }
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
