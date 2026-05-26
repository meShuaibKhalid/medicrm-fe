import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonImg, IonSearchbar, IonIcon } from '@ionic/angular/standalone';
import { CartService } from '../../core/services/cart.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { CategoryService } from 'src/app/core/services/category.service';
import { Category, Product } from 'src/app/shared/models/app.models';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, EmptyStateComponent, PriceDisplayComponent,IonSearchbar, IonImg, IonIcon,CategoryCardComponent],
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
                <app-price-display [price]="item.price" [salePrice]="item.salePrice" [salePercent]="item.product.salePercent"></app-price-display>
              </div>
              <div class="qty-row">
                <div class="qty-controls">
                  <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                </div>
                <button class="remove-btn" (click)="cartService.removeItem(item.product.id)">Remove</button>
              </div>
            </div>
          </div>

          <div class="totals-card">
            <div class="totals-lines">
              <div class="line"><span>Subtotal</span><span>Rs. {{ cart.subtotal | number:'1.0-2' }}</span></div>
              <div class="line"><span>Discount</span><span>- Rs. {{ cart.discountTotal | number:'1.0-2' }}</span></div>
              <div class="line"><span>Delivery fee</span><span>Rs. {{ cart.deliveryFee | number:'1.0-2' }}</span></div>
              <div class="line grand"><span>Grand total</span><span>Rs. {{ cart.grandTotal | number:'1.0-2' }}</span></div>
            </div>
            <button class="checkout-btn" routerLink="/checkout">PROCEED TO CHECKOUT</button>
          </div>

        </ng-container>
      </ng-container>
      <ng-template #emptyCart>
        <app-empty-state title="Your cart is empty" message="Add products to continue checkout." icon="bag-handle-outline"></app-empty-state>
      </ng-template>
    </div>
  </ion-content>
`,
  styles: [`
  .topbar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      .logo{
        height: 48px;
      }
    }
    .brand-block h1 {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -.04em;
      color: var(--ion-color-primary);
    }
    .brand-block span {
      display: block;
      color: var(--ion-color-primary);
      font-size: .82rem;
      font-weight: 600;
    }
    .search-block {
      margin: 0;
      padding: 0;
    }
    .utility-pill,
    .icon-pill {
    flex: 1;
    border: 0;
    background: #fff;
    min-height: 42px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 5px;
    font-weight: 700;
    color: #222;
    border: 1px solid #e3e6ef;
    font-size: 12px;
    max-width: 380px;
    min-width: 130px;
    }
    .utility-pill ion-icon,
    .icon-pill ion-icon {
      font-size: 22px;
      color: var(--ion-color-primary);
    }
    .action-pills {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      overflow-y: hidden;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
      margin-left: auto;
    }
    .action-pills::-webkit-scrollbar,
    .nav-scroll::-webkit-scrollbar {
      display: none;
    }

    .header-btn{
    position: relative;
    display: flex;
    align-items: center;
    background-color: #5e971a;
    color: #fff;
    padding: 7px 8px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1;
    margin-left: 6px;
    height: fit-content;
    white-space: nowrap;
    &.instant-btn {
      background-color: var(--ion-color-primary) !important;
    }
    &.action-btns {
      button {
        background: transparent;
      }
    }
    ion-icon {
      font-size: 25px;
      margin-right: 4px;
    }
    }
    .nav-scroll {
      display: flex;
      justify-content: unset;
      align-items: unset;
      flex-direction: row;
      flex-wrap: nowrap;
      padding: 0 5px;
      .category-list {
          display: flex;
          justify-content: center;
          align-items: unset;
          flex-direction: row;
          flex-wrap: nowrap;
          padding: 0 5px;
          flex-grow: 1;
          position: relative;
      }
    }

       :host ::ng-deep{
      ion-searchbar{
        input{
          background: transparent !important;
          font-size: 12px !important  ;
        }
      }
    }

    :host { --ion-background-color: var(--color-ice-blue); }

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
      align-items: center;
      gap: 0.5rem;
      font-size: 13px;
      color: var(--color-blue-gray);
      margin-bottom: 0.5rem;
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
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
      border: 1px solid var(--color-soft-blue-gray);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: box-shadow 0.2s;
    }

    .cart-item:hover {
      box-shadow: 0 8px 24px rgba(14,168,125,0.06);
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
    .remove-btn:hover { color: var(--ion-color-danger); }

    .totals-card {
      background: var(--color-white-near-white);
      border-radius: var(--app-border-radius-large, 18px);
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
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
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .checkout-btn:active {
      transform: translateY(2px);
      box-shadow: 0 4px 10px rgba(14, 168, 125, 0.2);
    }
  `],
})
export class CartPage {
  readonly cartService = inject(CartService);
  cart$ = this.cartService.cart$;
}
