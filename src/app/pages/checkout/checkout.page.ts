import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Address } from '../../shared/models/app.models';

@Component({
  selector: 'app-app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title  class="header-title">Checkout</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-card class="soft-card" *ngIf="currentUser">
          <ion-card-content>
            <h3>Contact Details (from Profile)</h3>
            <ion-item>
              <ion-label position="stacked">Name</ion-label>
              <ion-input [(ngModel)]="name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input [(ngModel)]="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Phone</ion-label>
              <ion-input [(ngModel)]="phone"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card" *ngIf="addresses.length > 0">
          <ion-card-content>
            <div class="section-title">
              <h3>Select Delivery Address</h3>
              <ion-button fill="clear" size="small" routerLink="/addresses"
                >Manage</ion-button
              >
            </div>
            <ion-item>
              <ion-label>Address Option</ion-label>
              <ion-select
                [ngModel]="selectedAddressId"
                (ngModelChange)="onAddressSelect($event)"
                interface="popover"
              >
                <ion-select-option
                  *ngFor="let addr of addresses"
                  [value]="addr.id"
                >
                  {{ addr.fullName }} · {{ addr.addressLine }}, {{ addr.city }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <div
              *ngIf="selectedAddress"
              style="margin-top: 12px; color: #5c4b53; font-size: 0.95rem;"
            >
              <p>
                <strong>Recipient:</strong> {{ selectedAddress.fullName }} ·
                {{ selectedAddress.phone }}
              </p>
              <p>
                {{ selectedAddress.addressLine }}, {{ selectedAddress.area }},
                {{ selectedAddress.city }}
              </p>
              <p *ngIf="selectedAddress.nearestLandmark">
                Landmark: {{ selectedAddress.nearestLandmark }}
              </p>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card" *ngIf="addresses.length === 0">
          <ion-card-content style="text-align: center; padding: 20px;">
            <h3>No addresses added</h3>
            <p style="color: #68818d; margin-bottom: 12px;">
              You need to add a shipping address before completing order.
            </p>
            <ion-button size="small" fill="solid" routerLink="/addresses"
              >Add Address</ion-button
            >
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card">
          <ion-card-content>
            <h3>Order summary</h3>
            <div class="line">
              <span>Subtotal</span
              ><strong>Rs. {{ cart.subtotal | number: '1.0-2' }}</strong>
            </div>
            <div class="line">
              <span>Discount</span
              ><strong>- Rs. {{ cart.discountTotal | number: '1.0-2' }}</strong>
            </div>
            <div class="line">
              <span>Delivery fee</span
              ><strong>Rs. {{ cart.deliveryFee | number: '1.0-2' }}</strong>
            </div>
            <div class="line grand">
              <span>Grand total</span
              ><strong>Rs. {{ cart.grandTotal | number: '1.0-2' }}</strong>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-list class="soft-card">
          <ion-item>
            <ion-label>Payment method</ion-label>
          </ion-item>
          <ion-radio-group value="cod">
            <ion-item>
              <ion-radio slot="start" value="cod"></ion-radio>
              <ion-label>Cash on Delivery</ion-label>
            </ion-item>
          </ion-radio-group>
        </ion-list>

        <ion-button
          expand="block"
          shape="round"
          [disabled]="!selectedAddress || !cart.items.length || placingOrder"
          (click)="placeOrder()"
        >
          <span *ngIf="!placingOrder">Place Order</span>
          <span *ngIf="placingOrder">Placing...</span>
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-shell {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
        font-family: 'Poppins', sans-serif;
      }

      .header-title {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        color: var(--color-navy-black);
        padding: 0 1rem;
        max-width: 800px;
        margin: 0 auto;
        font-size: 1.2rem;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .grand {
        padding-top: 8px;
        border-top: 1px solid #dce7e5;
      }
    `,
  ],
})
export class CheckoutPage {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly addressService = inject(AddressService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  currentUser: any = null;
  addresses: Address[] = [];
  selectedAddressId = '';
  name = '';
  email = '';
  phone = '';

  constructor() {
    const token = localStorage.getItem('token');
    if (!token && !this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/checkout' },
      });
      return;
    }
    if (!this.cart.items.length) {
      this.router.navigateByUrl('/cart');
      return;
    }

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.name = user.name || '';
        this.email = user.email || '';
        this.phone = user.phone || '';
      }
    });

    this.addressService.getAddresses().subscribe((addrs) => {
      this.addresses = addrs;
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) {
        this.selectedAddressId = def.id;
      }
    });
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find((a) => a.id === this.selectedAddressId);
  }

  onAddressSelect(id: string): void {
    this.selectedAddressId = id;
    this.addressService.setDefaultAddress(id).subscribe();
  }

  get cart() {
    return this.cartService.getCurrentCart();
  }

  placingOrder = false;

  placeOrder(): void {
    const cart = this.cartService.getCurrentCart();
    const addressId = this.selectedAddressId;
    if (!cart.items.length || !addressId) {
      return;
    }

    this.placingOrder = true;
    this.orderService.createOrder({ addressId }).subscribe({
      next: () => {
        this.placingOrder = false;
        this.cartService.clearCart(); // Clear local state, backend clears it too
        this.router.navigateByUrl('/order-success');
      },
      error: (err) => {
        this.placingOrder = false;
        alert(err.error?.message || 'Failed to place order. Please try again.');
      },
    });
  }
}
