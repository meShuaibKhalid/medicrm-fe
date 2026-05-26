import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IonBadge, IonButton, IonCard, IonCardContent, IonIcon, IonImg } from '@ionic/angular/standalone';
import { Product } from '../../models/app.models';
import { PriceDisplayComponent } from '../price-display/price-display.component';
import { WishlistService } from 'src/app/core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IonBadge, IonButton, IonCard, IonCardContent, IonIcon, IonImg, PriceDisplayComponent],
  template: `
    <ion-card class="product-card soft-card">
      <button class="wishlist-btn" type="button" (click)="toggleWishlist($event)">
        <ion-icon [name]="isInWishlist() ? 'heart' : 'heart-outline'"></ion-icon>
      </button>
      <div class="thumb" (click)="openProduct.emit(product)">
        <ion-img [src]="product.image" [alt]="product.title"></ion-img>
        <!-- <ion-img src="assets/test.webp"></ion-img> -->
          <button class="cart-btn" expand="block" shape="round" fill="outline" [disabled]="product.stock < 1" (click)="addToCart.emit(product)" (click)="$event.stopPropagation()">
            <!-- <ion-icon slot="start" name="bag-add-outline"></ion-icon> -->
            <ion-icon name="cart-outline"></ion-icon>
          </button>
      </div>
      <ion-card-content>
        <div class="meta" (click)="openProduct.emit(product)">
          <h3>{{ product.title }}</h3>
          <div class="badges-container">
            <p>{{ product.brand }}</p>
            <div class="badges">
              <ion-badge [color]="product.stock > 0 ? 'success' : 'medium'">{{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}</ion-badge>
              <ion-badge *ngIf="product.prescriptionRequired" color="warning">Prescription Required</ion-badge>
            </div>

          </div>
        </div>
        <div class="card-cart-section">
          <app-price-display [price]="product.price" [salePrice]="product.salePrice" [salePercent]="product.salePercent" class="w-full"></app-price-display>
        
      </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .product-card {
      margin: 0;
      overflow: hidden;
      position: relative;
      border-radius: 14px;
      padding-top: 10px;
      border: 0 !important;
      ion-card-content{
            text-align: left;
          padding: 5px 5px 15px 0;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
      }
    &:hover{
        .cart-btn{
          opacity: 1;
        }
    }
    }

     .cart-btn{
      opacity: 0;
     }
    .wishlist-btn {
      position: absolute;
      top: 20px;
      right: 15px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid #d9deea;
      background: #fff;
      display: grid;
      place-items: center;
      z-index: 2;
    }
    .wishlist-btn ion-icon {
      color: var(--ion-color-primary);
      font-size: 24px;
    }
    .thumb {
         padding: 10px;
        cursor: pointer;
        overflow: hidden;
        border: 1px solid var(--color-soft-blue-gray);
        border-radius: var(--app-border-radius-small, 8px);
        position: relative;
          button{
         font-size: 25px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--ion-color-primary);
    position: absolute;
    bottom: 5px;
    right: 5px;
      }
    }
    ion-img {
      height: 190px;
      object-fit: contain;
    }

    .card-cart-section{
      display:flex;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    
    }
    .meta h3 {
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-transform: capitalize;
    font-size: .8rem;
    line-height: 1.5;
    letter-spacing: 0.00938em;    
    }
    .meta p {
      font-size: .76rem;
      color: #8b8f9d;
      text-transform: uppercase;
      letter-spacing: .02em;
    }
    .badges-container{
      display:flex;
      align-items:center;
      justify-content:space-between;
       margin-bottom: 3px;
    }
    .badges {
      display:flex;
      gap:6px;
      flex-wrap:wrap;
      margin-left: auto;
      ion-badge{
            color: white;
    padding: 3px 5px;
      }
    }
    ion-button {
      margin-top: 14px;
      --border-color: #d6dced;
      --color: #2d2d2d;
    }
    // @media (min-width: 768px) {
    //   ion-img {
    //     height: 220px;
    //   }
    // }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() openProduct = new EventEmitter<Product>();

  ngOnChanges(){
    if (this.product?.image?.includes('dvago-logo.svg')) {
      this.product.image = '/assets/logo.png'
    }
  }

  wishlistService = inject(WishlistService);

  isInWishlist(): boolean {
    return this.wishlistService.getCurrentWishlist().items.some(item => item.product.id === this.product.id);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    if (this.isInWishlist()) {
      this.wishlistService.removeItem(this.product.id);
    } else {
      this.wishlistService.addItem(this.product);
    }
  }
}
