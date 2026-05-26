import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon, EmptyStateComponent, PriceDisplayComponent],
  template: `
  <ion-content>
    <div class="page-shell wishlist-page">
      <div class="dvago-breadcrumb">
        <span routerLink="/home" style="cursor:pointer;">Home</span>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>Wishlist</span>
      </div>
      <ng-container *ngIf="wishlist$ | async as wishlist">
        <ng-container *ngIf="wishlist.items.length; else emptyWishlist">
          <div class="wishlist-list">
            <div class="wishlist-item" *ngFor="let item of wishlist.items">
              <div class="item-img" [routerLink]="['/products', item.product.slug]">
                <img [src]="item.product.image" [alt]="item.product.title" />
              </div>
              <div class="item-info">
                <p class="item-title" [routerLink]="['/products', item.product.slug]">{{ item.product.title }}</p>
                <p class="item-brand">{{ item.product.brand }}</p>
                <app-price-display [price]="item.product.price" [salePrice]="item.product.salePrice" [salePercent]="item.product.salePercent"></app-price-display>
              </div>
              <div class="action-row">
                <button class="move-btn" (click)="moveToCart(item.product)" [disabled]="item.product.stock < 1"> <ion-icon name="cart-outline"></ion-icon>Move to Cart</button>
                <button class="remove-btn" (click)="wishlistService.removeItem(item.product.id)"><ion-icon name="trash-outline"></ion-icon>Remove</button>
              </div>
            </div>
          </div>
        </ng-container>
      </ng-container>
      <ng-template #emptyWishlist>
        <app-empty-state title="Your wishlist is empty" message="Add items that you like to your wishlist." icon="heart-outline"></app-empty-state>
      </ng-template>
    </div>
  </ion-content>
  `,
  styles: [`
    :host { --ion-background-color: var(--color-ice-blue); }

    .wishlist-page {
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

    .wishlist-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .wishlist-item {
      background: var(--color-white-near-white);
      border-radius: var(--app-border-radius-large, 18px);
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
      border: 1px solid var(--color-soft-blue-gray);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: box-shadow 0.2s;
    }

    .wishlist-item:hover {
      box-shadow: 0 8px 24px rgba(14,168,125,0.06);
    }

    .item-img {
      width: 80px;
      height: 80px;
      cursor: pointer;
      border-radius: var(--app-border-radius-small, 8px);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-white-near-white);
      border: 1px solid var(--color-soft-blue-gray);
    }
    
    .item-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
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
      cursor: pointer;
    }
    
    .item-title:hover {
      color: var(--ion-color-primary);
    }

    .item-brand {
      margin: 0 0 8px;
      font-size: 12px;
      color: var(--color-blue-gray);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .action-row {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
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
            display: flex;
      align-items: center;

    }
    .remove-btn:hover { color: var(--ion-color-danger); }

    .move-btn {
      padding: 8px 16px;
      background: var(--ion-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: var(--app-border-radius-small, 8px);
      cursor: pointer;
      transition: background 0.18s;
            display: flex;
      align-items: center;
            ion-icon{
            margin-right: 6px;
    font-size: 16px;
      }
    }

    .move-btn:disabled { background: #dcdcdc; color: #a1a1a1; cursor: not-allowed; }

    @media (max-width: 600px) {
      .wishlist-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .action-row {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `]
})
export class WishlistPage {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);
  wishlist$ = this.wishlistService.wishlist$;

  moveToCart(product: any) {
    this.wishlistService.moveToCart(product);
  }
}
