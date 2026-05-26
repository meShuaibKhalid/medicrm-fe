import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models/app.models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonTitle,
    IonToolbar,
    ProductCardComponent,
    PriceDisplayComponent,
  ],
  template: `
    <!-- ion-header stays the same -->

    <ion-content *ngIf="product">
      <div class="page-shell">
        <ion-card class="soft-card">
          <!-- Image -->
          <div class="detail-image">
            <ion-img [src]="product.image" [alt]="product.title"></ion-img>
            <ion-badge
              [color]="product.stock > 0 ? 'success' : 'medium'"
              class="stock-overlay"
            >
              {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
            </ion-badge>
          </div>

          <ion-card-content>
            <!-- Brand pill -->
            <div class="brand-pill">{{ product.brand }}</div>

            <h1>{{ product.title }}</h1>

            <!-- Price row -->
            <div class="price-row">
              <app-price-display
                [price]="product.price"
                [salePrice]="product.salePrice"
                [salePercent]="product.salePercent"
              ></app-price-display>
            </div>

            <ion-badge
              *ngIf="product.prescriptionRequired"
              color="warning"
              class="rx-badge"
            >
              Prescription Required
            </ion-badge>

            <div class="divider"></div>

            <!-- Quantity -->
            <div class="quantity-row">
              <span class="qty-label">Quantity</span>
              <div class="quantity-box">
                <ion-button
                  fill="outline"
                  size="small"
                  shape="round"
                  (click)="decreaseQuantity()"
                  >−</ion-button
                >
                <strong>{{ quantity }}</strong>
                <ion-button
                  fill="outline"
                  size="small"
                  shape="round"
                  (click)="increaseQuantity()"
                  >+</ion-button
                >
              </div>
            </div>

            <!-- Description -->
            <div class="info-section">
              <p class="info-label">Description</p>
              <p class="info-text">{{ product.description }}</p>
            </div>
            <div class="info-section">
              <p class="info-label">Used For</p>
              <p class="info-text">{{ product.usedFor }}</p>
            </div>

            <ion-button
              expand="block"
              shape="round"
              class="cta-btn"
              (click)="addToCart()"
            >
              <ion-icon name="cart-outline" slot="start"></ion-icon>
              Add to Cart
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Related -->
        <div class="section-header">
          <h3>Related Products</h3>
          <div class="section-line"></div>
        </div>
        <div class="product-grid">
          <app-product-card
            *ngFor="let item of relatedProducts"
            [product]="item"
            (addToCart)="addRelatedToCart($event)"
            (openProduct)="openRelated($event)"
          >
          </app-product-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .soft-card {
        display: flex;
        @media (max-width: 768px) {
          flex-direction: column;
        }
      }
      ion-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: start;
        padding-top: 24px;
      }
      .detail-image {
        position: relative;
        padding: 32px 24px 24px;
        background: linear-gradient(160deg, #eef8f5, #f8fcfa);
        flex: 1;
        display: flex;

        ion-img {
          // height: 200px;
          object-fit: contain;
          margin: auto;
          aspect-ratio: 4 / 3;
        }

        .stock-overlay {
          position: absolute;
          top: 14px;
          right: 14px;
          border-radius: 20px;
          font-size: 11px;
        }
      }

      .brand-pill {
        display: inline-block;
        background: #e1f5ee;
        color: #0f6e56;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 20px;
        margin-bottom: 8px;
        letter-spacing: 0.04em;
      }

      h1 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #0e2d3d;
        margin-bottom: 10px;
      }

      .divider {
        height: 0.5px;
        background: rgba(29, 158, 117, 0.15);
        margin: 14px 0;
      }

      .quantity-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 12px 0;
        width: 100%;
        .qty-label {
          font-size: 13px;
          font-weight: 500;
          color: #4a6b78;
        }
        .quantity-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .cta-btn {
        --border-radius: 14px;
        font-weight: 600;
        margin: auto 0 15px;
        --background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        --box-shadow: 0;
      }

      .info-section {
        margin-bottom: 12px;
      }
      .info-label {
        font-size: 11px;
        font-weight: 600;
        color: #0f6e56;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        margin-bottom: 4px;
      }
      .info-text {
        font-size: 13.5px;
        color: #4a6b78;
        line-height: 1.6;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px 10px;
        h3 {
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          color: #0e2d3d;
        }
        .section-line {
          flex: 1;
          height: 0.5px;
          background: rgba(29, 158, 117, 0.15);
        }
      }

      .product-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        padding: 0 12px;
        @media (min-width: 768px) {   
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (min-width: 992px) {
            grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }
      ::ng-deep .price-row {
        .prices strong {
          font-size: 22px !important;
        }
      }
    `,
  ],
})
export class ProductDetailPage {
  readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  product?: Product;
  relatedProducts: Product[] = [];
  quantity = 1;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.productService.getProductBySlug(slug).subscribe((product) => {
        this.product = product;
        this.productService.getFeaturedProducts().subscribe((products) => {
          this.relatedProducts = products
            .filter((item) => item.slug !== slug)
            .slice(0, 2);
        });
      });
    });
  }

  addToCart(): void {
    if (this.product) {
      if (!this.authService.isLoggedIn()) {
        this.cartService.setPendingItem(
          this.product,
          this.quantity,
          this.router.url,
        );
        this.router.navigate(['/register'], {
          queryParams: { redirectTo: this.router.url },
        });
        return;
      }
      this.cartService.addItem(this.product, this.quantity);
    }
  }

  addRelatedToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.cartService.setPendingItem(product, 1, this.router.url);
      this.router.navigate(['/register'], {
        queryParams: { redirectTo: this.router.url },
      });
      return;
    }
    this.cartService.addItem(product, 1);
  }

  decreaseQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  increaseQuantity(): void {
    if (this.product) {
      this.quantity = Math.min(this.product.maxOrder, this.quantity + 1);
    }
  }

  openRelated(product: Product): void {
    this.router.navigate(['/products', product.slug]);
  }
}
