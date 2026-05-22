import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Checkout</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-card class="soft-card" *ngIf="defaultAddress as address">
          <ion-card-content>
            <div class="section-title"><h3>Selected delivery address</h3><ion-button fill="clear" size="small" routerLink="/addresses">Change</ion-button></div>
            <p>{{ address.fullName }} · {{ address.phone }}</p>
            <p>{{ address.addressLine }}, {{ address.area }}, {{ address.city }}</p>
            <p>{{ address.nearestLandmark }}</p>
          </ion-card-content>
        </ion-card>
        <ion-card class="soft-card">
          <ion-card-content>
            <h3>Order summary</h3>
            <div class="line"><span>Subtotal</span><strong>Rs. {{ cart.subtotal | number:'1.0-2' }}</strong></div>
            <div class="line"><span>Discount</span><strong>- Rs. {{ cart.discountTotal | number:'1.0-2' }}</strong></div>
            <div class="line"><span>Delivery fee</span><strong>Rs. {{ cart.deliveryFee | number:'1.0-2' }}</strong></div>
            <div class="line grand"><span>Grand total</span><strong>Rs. {{ cart.grandTotal | number:'1.0-2' }}</strong></div>
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
        <ion-button expand="block" shape="round" [disabled]="!defaultAddress || !cart.items.length" (click)="placeOrder()">Place Order</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`.line { display:flex; justify-content:space-between; margin-bottom:8px; } .grand { padding-top:8px; border-top:1px solid #dce7e5; }`],
})
export class CheckoutPage {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly addressService = inject(AddressService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/register'], { queryParams: { redirectTo: '/checkout' } });
      return;
    }
    if (!this.cart.items.length) {
      this.router.navigateByUrl('/cart');
      return;
    }
    if (!this.defaultAddress) {
      this.router.navigate(['/addresses'], { queryParams: { redirectTo: '/checkout' } });
    }
  }

  get defaultAddress() {
    return this.addressService.getDefaultAddress();
  }

  get cart() {
    return this.cartService.getCurrentCart();
  }

  placeOrder(): void {
    const cart = this.cartService.getCurrentCart();
    const address = this.defaultAddress;
    if (!cart.items.length || !address) {
      return;
    }
    this.orderService.createOrder(cart, address).subscribe(() => {
      this.cartService.clearCart();
      this.router.navigateByUrl('/order-success');
    });
  }
}
