import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CartService } from '../../core/services/cart.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    EmptyStateComponent,
    PriceDisplayComponent,
    IonIcon,
  ],
  template: `
    <ion-content>
      <div class="page-shell cart-page">
        <div class="dvago-breadcrumb">
          <span>Home</span>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <span>Cart</span>
        </div>
        <ng-container *ngIf="cart$ | async as cart">
          <ng-container *ngIf="cart.items.length; else emptyCart">
            <div class="cart-list">
              <div class="cart-item" *ngFor="let item of cart.items">
                <div class="item-info">
                  <p class="item-title">{{ item.product.title }}</p>
                  <p class="item-brand">{{ item.product.brand }}</p>
                  <app-price-display
                    [price]="item.price"
                    [salePrice]="item.salePrice"
                    [salePercent]="item.product.salePercent"
                  ></app-price-display>
                </div>
                <div class="qty-row">
                  <div class="qty-controls">
                    <button
                      class="qty-btn"
                      (click)="
                        item.quantity - 1 === 0
                          ? cartService.removeItem(item.product.id)
                          : cartService.updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                      "
                    >
                      -
                    </button>
                    <span class="qty-val">{{ item.quantity }}</span>
                    <button
                      class="qty-btn"
                      (click)="
                        cartService.updateQuantity(
                          item.product.id,
                          item.quantity + 1
                        )
                      "
                    >
                      +
                    </button>
                  </div>
                  <button
                    class="remove-btn"
                    (click)="cartService.removeItem(item.product.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="totals-card">
              <div class="totals-lines">
                <div class="line">
                  <span>Subtotal</span
                  ><span>Rs. {{ cart.subtotal | number: '1.0-2' }}</span>
                </div>
                <div class="line">
                  <span>Discount</span
                  ><span>- Rs. {{ cart.discountTotal | number: '1.0-2' }}</span>
                </div>
                <div class="line">
                  <span>Delivery fee</span
                  ><span>Rs. {{ cart.deliveryFee | number: '1.0-2' }}</span>
                </div>
                <div class="line grand">
                  <span>Grand total</span
                  ><span>Rs. {{ cart.grandTotal | number: '1.0-2' }}</span>
                </div>
              </div>
              <button class="checkout-btn" routerLink="/checkout">
                PROCEED TO CHECKOUT
              </button>
            </div>
          </ng-container>
        </ng-container>
        <ng-template #emptyCart>
          <app-empty-state
            title="Your cart is empty"
            message="Add products to continue checkout."
            icon="bag-handle-outline"
          ></app-empty-state>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host {
        --ion-background-color: var(--color-ice-blue);
      }

      .cart-page {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
        font-family: 'Poppins', sans-serif;
      }

      .dvago-breadcrumb {
        display: flex;
        gap: 10px;
        align-items: center;
        color: var(--ion-color-primary);
        font-size: 1rem;
        margin: 10px 0 0;
      }

      .dvago-breadcrumb ion-icon {
        font-size: 12px;
      }

      .cart-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .cart-item {
        background: var(--color-white-near-white);
        border-radius: var(--app-border-radius-large, 18px);
        padding: 1.25rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        border: 1px solid var(--color-soft-blue-gray);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: box-shadow 0.2s;
      }

      .cart-item:hover {
        box-shadow: 0 8px 24px rgba(14, 168, 125, 0.06);
      }

      .item-info {
        flex: 1;
      }

      .item-title {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 700;
        color: var(--color-navy-black);
        line-height: 1.4;
      }

      .item-brand {
        margin: 0 0 8px;
        font-size: 12px;
        color: var(--color-blue-gray);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .qty-row {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }

      .qty-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--color-pale-mint);
        border-radius: 20px;
        padding: 4px 6px;
        border: 1px solid var(--color-soft-blue-gray);
      }

      .qty-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 50%;
        background: var(--color-white-near-white);
        color: var(--ion-color-primary);
        font-size: 18px;
        font-weight: 600;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(14, 168, 125, 0.15);
        transition: transform 0.1s;
      }

      .qty-btn:active {
        transform: scale(0.95);
      }

      .qty-val {
        min-width: 24px;
        text-align: center;
        font-size: 15px;
        font-weight: 700;
        color: var(--color-navy-black);
      }

      .remove-btn {
        background: none;
        border: none;
        color: var(--color-blue-gray);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        padding: 0;
        text-transform: uppercase;
        transition: color 0.2s;
      }
      .remove-btn:hover {
        color: var(--ion-color-danger);
      }

      .totals-card {
        background: var(--color-white-near-white);
        border-radius: var(--app-border-radius-large, 18px);
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--color-soft-blue-gray);
        margin-top: 1rem;
      }

      .totals-lines {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .line {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--color-slate-gray);
        font-weight: 500;
      }

      .line.grand {
        border-top: 2px dashed var(--color-soft-blue-gray);
        margin-top: 8px;
        padding-top: 16px;
        font-weight: 800;
        font-size: 18px;
        color: var(--color-navy-black);
      }

      .checkout-btn {
        display: block;
        width: calc(100% - 3rem);
        margin: 0 1.5rem 1.5rem;
        padding: 1.1rem;
        background: var(--ion-color-primary);
        color: #fff;
        border: none;
        border-radius: var(--app-border-radius, 12px);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        text-align: center;
        box-shadow: 0 8px 20px rgba(14, 168, 125, 0.25);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .checkout-btn:active {
        transform: translateY(2px);
        box-shadow: 0 4px 10px rgba(14, 168, 125, 0.2);
      }
    `,
  ],
})
export class CartPage {
  readonly cartService = inject(CartService);
  cart$ = this.cartService.cart$;
}
