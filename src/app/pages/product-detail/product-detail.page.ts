import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonImg, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models/app.models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonImg, IonTitle, IonToolbar, ProductCardComponent, PriceDisplayComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="router.navigateByUrl('/home')"><ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon></ion-button>
        </ion-buttons>
        <ion-title>Product Detail</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content *ngIf="product">
      <div class="page-shell">
        <ion-card class="soft-card">
          <div class="detail-image"><ion-img [src]="product.image" [alt]="product.title"></ion-img></div>
          <ion-card-content>
            <h1>{{ product.title }}</h1>
            <p class="brand">{{ product.brand }}</p>
            <app-price-display [price]="product.price" [salePrice]="product.salePrice" [salePercent]="product.salePercent"></app-price-display>
            <div class="badges">
              <ion-badge [color]="product.stock > 0 ? 'success' : 'medium'">{{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}</ion-badge>
              <ion-badge *ngIf="product.prescriptionRequired" color="warning">Prescription Required</ion-badge>
            </div>
            <div class="quantity-box">
              <ion-button fill="outline" size="small" (click)="decreaseQuantity()">-</ion-button>
              <strong>{{ quantity }}</strong>
              <ion-button fill="outline" size="small" (click)="increaseQuantity()">+</ion-button>
            </div>
            <ion-button expand="block" shape="round" (click)="addToCart()">Add to Cart</ion-button>
            <h3>Description</h3>
            <p>{{ product.description }}</p>
            <h3>Used For</h3>
            <p>{{ product.usedFor }}</p>
          </ion-card-content>
        </ion-card>

        <div class="section-title"><h3>Related Products</h3></div>
        <div class="product-grid">
          <app-product-card *ngFor="let item of relatedProducts" [product]="item" (addToCart)="addRelatedToCart($event)" (openProduct)="openRelated($event)"></app-product-card>
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

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.productService.getProductBySlug(slug).subscribe((product) => {
        this.product = product;
        this.productService.getFeaturedProducts().subscribe((products) => {
          this.relatedProducts = products.filter((item) => item.slug !== slug).slice(0, 2);
        });
      });
    });
  }

  addToCart(): void {
    if (this.product) {
      if (!this.authService.isLoggedIn()) {
        this.cartService.setPendingItem(this.product, this.quantity, this.router.url);
        this.router.navigate(['/register'], { queryParams: { redirectTo: this.router.url } });
        return;
      }
      this.cartService.addItem(this.product, this.quantity);
    }
  }

  addRelatedToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.cartService.setPendingItem(product, 1, this.router.url);
      this.router.navigate(['/register'], { queryParams: { redirectTo: this.router.url } });
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
