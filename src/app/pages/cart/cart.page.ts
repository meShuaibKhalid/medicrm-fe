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
      <ng-container *ngIf="cart.items.length; else emptyCart">

        <div class="cart-list">
          <div class="cart-item" *ngFor="let item of cart.items">
            <div class="item-info">
              <p class="item-title">{{ item.product.title }}</p>
              <p class="item-brand">{{ item.product.brand }}</p>
              <app-price-display [price]="item.price" [salePrice]="item.salePrice" [salePercent]="item.product.salePercent"></app-price-display>
            </div>
            <div class="qty-row">
              <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">-</button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</button>
              <button class="remove-btn" (click)="cartService.removeItem(item.product.id)">REMOVE</button>
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
    &.instant-btn{
      background-color: #bb5a77 !important;
    }
    &.action-btns{
      button{
        background: transparent;
      }
    }
    ion-icon{
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
      .category-list{
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
  .cart-page {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
  }

  ion-title{
        max-width: 800px;
    margin: auto;
  }

  .cart-list {
    border: 1px solid #e3e6ef;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
  }

  .cart-item {
    padding: 16px 20px;
    border-bottom: 1px solid #e3e6ef;
  }
  .cart-item:last-child {
    border-bottom: none;
  }

  .item-title {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1.4;
  }

  .item-brand {
    margin: 0 0 4px;
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .qty-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
  }

  .qty-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #c8a0b0;
    border-radius: 6px;
    background: #fff;
    color: #b05070;
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qty-val {
    min-width: 28px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .remove-btn {
    margin-left: 8px;
    background: none;
    border: none;
    color: #b05070;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 0;
  }

  .totals-card {
    border: 1px solid #e3e6ef;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
  }

  .totals-lines {
    padding: 16px 20px 8px;
  }

  .line {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #333;
    padding: 6px 0;
  }

  .line.grand {
    border-top: 1px solid #e3e6ef;
    margin-top: 4px;
    padding-top: 12px;
    font-weight: 600;
    font-size: 15px;
    color: #1a1a1a;
  }

  .checkout-btn {
    display: block;
    width: calc(100% - 32px);
    margin: 12px 16px 16px;
    padding: 14px;
    background: #b05070;
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    text-align: center;
  }
  `],
})
export class CartPage {
  readonly cartService = inject(CartService);

  get cart() {
    return this.cartService.getCurrentCart();
  }
}
