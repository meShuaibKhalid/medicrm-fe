import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CartService } from '../../core/services/cart.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, EmptyStateComponent, PriceDisplayComponent],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Cart</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell">
        <ng-container *ngIf="cart.items.length; else emptyCart">
          <ion-list class="soft-card">
            <ion-item *ngFor="let item of cart.items">
              <ion-label>
                <h2>{{ item.product.title }}</h2>
                <p>{{ item.product.brand }}</p>
                <app-price-display [price]="item.price" [salePrice]="item.salePrice" [salePercent]="item.product.salePercent"></app-price-display>
                <div class="qty-row">
                  <ion-button size="small" fill="outline" (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">-</ion-button>
                  <strong>{{ item.quantity }}</strong>
                  <ion-button size="small" fill="outline" (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</ion-button>
                  <ion-button size="small" color="danger" fill="clear" (click)="cartService.removeItem(item.product.id)">Remove</ion-button>
                </div>
              </ion-label>
            </ion-item>
          </ion-list>

          <ion-card class="soft-card totals-card">
            <ion-card-content>
              <div class="line"><span>Subtotal</span><strong>Rs. {{ cart.subtotal | number:'1.0-2' }}</strong></div>
              <div class="line"><span>Discount</span><strong>- Rs. {{ cart.discountTotal | number:'1.0-2' }}</strong></div>
              <div class="line"><span>Delivery fee</span><strong>Rs. {{ cart.deliveryFee | number:'1.0-2' }}</strong></div>
              <div class="line grand"><span>Grand total</span><strong>Rs. {{ cart.grandTotal | number:'1.0-2' }}</strong></div>
              <ion-button expand="block" shape="round" routerLink="/checkout">Proceed to Checkout</ion-button>
            </ion-card-content>
          </ion-card>
        </ng-container>
        <ng-template #emptyCart>
          <app-empty-state title="Your cart is empty" message="Add products to continue checkout." icon="bag-handle-outline"></app-empty-state>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [`
    .qty-row { display:flex; align-items:center; gap:10px; margin-top: 10px; flex-wrap:wrap; }
    .line { display:flex; justify-content:space-between; margin-bottom: 8px; }
    .grand { padding-top: 8px; border-top: 1px solid #dce7e5; }
  `],
})
export class CartPage {
  readonly cartService = inject(CartService);

  get cart() {
    return this.cartService.getCurrentCart();
  }
}
