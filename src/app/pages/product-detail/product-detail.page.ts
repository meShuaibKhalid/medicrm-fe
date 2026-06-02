import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonImg, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { switchMap } from 'rxjs';
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
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="router.navigateByUrl('/home')"><ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon></ion-button>
        </ion-buttons>
        <ion-title>Product Detail</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-shell state-card" *ngIf="loading">
        Loading product...
      </div>

      <div class="page-shell state-card" *ngIf="!loading && loadError">
        <p>{{ loadError }}</p>
        <ion-button shape="round" (click)="router.navigateByUrl('/home')">Back to Home</ion-button>
      </div>

      <div *ngIf="product && !loading">
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
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-image { padding: 20px; background: linear-gradient(180deg,#eef8f5,#fff); }
    ion-img { height: 220px; object-fit: contain; }
    h1 { font-size: 1.2rem; margin: 0 0 6px; color:#173d52; }
    .brand { color:#6b8490; margin:0 0 12px; }
    .badges, .quantity-box { display:flex; align-items:center; gap:10px; margin:14px 0; }
    h3 { margin: 16px 0 6px; color:#173d52; }
    .product-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .state-card { padding-top: 24px; color: #64748b; }
  `],
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
  loading = true;
  loadError = '';

  constructor() {
    const routedProduct = history.state?.product as Product | undefined;
    if (routedProduct?.slug) {
      this.product = routedProduct;
      this.loading = false;
    }

    this.route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug') ?? '';
        this.quantity = 1;
        this.loadError = '';
        this.loading = !this.product || this.product.slug !== slug;
        return this.productService.getProductBySlug(slug);
      }),
    ).subscribe((product) => {
      if (!product) {
        this.product = undefined;
        this.relatedProducts = [];
        this.loading = false;
        this.loadError = 'Product not found or failed to load.';
        return;
      }

      this.product = product;
      this.loading = false;
      this.productService.getFeaturedProducts().subscribe((products) => {
        this.relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 2);
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
    this.router.navigate(['/products', product.slug], { state: { product } });
  }
}
