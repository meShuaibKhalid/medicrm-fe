import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonBadge, IonButton, IonCard, IonCardContent, IonIcon, IonImg } from '@ionic/angular/standalone';
import { Product } from '../../models/app.models';
import { PriceDisplayComponent } from '../price-display/price-display.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IonBadge, IonButton, IonCard, IonCardContent, IonIcon, IonImg, PriceDisplayComponent],
  template: `
    <ion-card class="product-card soft-card">
      <button class="wishlist-btn" type="button">
        <ion-icon name="heart-outline"></ion-icon>
      </button>
      <div class="thumb" (click)="openProduct.emit(product)">
        <ion-img [src]="product.image" [alt]="product.title"></ion-img>
      </div>
      <ion-card-content>
        <div class="meta" (click)="openProduct.emit(product)">
          <h3>{{ product.title }}</h3>
          <p>{{ product.brand }}</p>
        </div>
        <div class="badges">
          <ion-badge [color]="product.stock > 0 ? 'success' : 'medium'">{{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}</ion-badge>
          <ion-badge *ngIf="product.prescriptionRequired" color="warning">Prescription Required</ion-badge>
        </div>
        <app-price-display [price]="product.price" [salePrice]="product.salePrice" [salePercent]="product.salePercent"></app-price-display>
        <ion-button expand="block" shape="round" fill="outline" [disabled]="product.stock < 1" (click)="addToCart.emit(product)">
          <ion-icon slot="start" name="bag-add-outline"></ion-icon>
          Add
        </ion-button>
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
    }
    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
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
      background: #fff;
      padding: 22px 18px 10px;
      cursor: pointer;
    }
    ion-img {
      height: 190px;
      object-fit: contain;
    }
    .meta h3 {
      margin: 0 0 4px;
      font-size: 1rem;
      line-height: 1.45;
      color: #3b3b3b;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 46px;
    }
    .meta p {
      margin: 0 0 10px;
      font-size: .76rem;
      color: #8b8f9d;
      text-transform: uppercase;
      letter-spacing: .02em;
    }
    .badges {
      display:flex;
      gap:6px;
      flex-wrap:wrap;
      margin-bottom: 10px;
    }
    ion-button {
      margin-top: 14px;
      --border-color: #d6dced;
      --color: #2d2d2d;
    }
    @media (min-width: 768px) {
      ion-img {
        height: 220px;
      }
    }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() openProduct = new EventEmitter<Product>();
}
