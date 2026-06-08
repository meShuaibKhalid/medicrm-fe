import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Category, Product } from '../../shared/models/app.models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonItem, IonLabel, IonList, ProductCardComponent],
  template: `
    <ion-content>
      <div class="page-shell homepage-shell">
        <ion-card class="hero soft-card">
          <ion-card-content>
            <ion-badge color="success">Fast delivery</ion-badge>
            <h2>Order medicines online</h2>
            <p>Shop pharmacy products, daily essentials, and health support with a cleaner storefront inspired by the reference layout.</p>
            <button class="shop-btn" routerLink="/categories">Shop Now</button>
          </ion-card-content>
        </ion-card>

        <div class="section-title">
          <h2>Trending Categories</h2>
        </div>
        <div class="dvago-chip-list">
          <button class="dvago-outlined-chip" *ngFor="let category of categories" [routerLink]="['/categories', category.slug, 'products']">{{ category.name }}</button>
        </div>

        <div class="section-title">
          <h2>Featured Products</h2>
        </div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredFeaturedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="section-title">
          <h2>Discounted Products</h2>
        </div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredDiscountedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>
      </div>
    </ion-content>

  `,
  styles: [`
    .homepage-shell {
      padding-top: 12px;
    }
    .hero {
      margin: 8px 0 26px;
      color: #2e2e2e;
      border-radius: 20px;
      background: linear-gradient(180deg, #FFFFFF 0%, #EBF3FC 100%);
      background-image: url('/assets/banner.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: right center;
      @media (max-width: 768px) {
        background-image: none;
        background: linear-gradient(135deg, #fff6f8, #ffffff);
      }
      .shop-btn{
            background: linear-gradient(
            135deg,
            #10b981,
            #059669);
          text-transform: capitalize;
          padding: 8px 20px;
          font-size: 0.8rem !important;
          color: #fff !important;
          border-radius: var(--app-border-radius-small, 8px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.25);
          font-weight: 700;
      }
      ion-card-content {
        @media (min-width: 768px) {
          width: 60%;
        }
      }
    }
    .hero h2 {
      margin: 12px 0 8px;
      font-size: 1.8rem;
      color: var(--ion-color-primary);
    }
    .hero p {
      margin: 0 0 14px;
      color: #666;
      max-width: 680px;
    }
    .info-list {
      overflow: hidden;
    }
    :host ::ng-deep{
      .product-grid{
        app-product-card{
          height: auto !important;
          ion-card{
            height: 100% !important;
            .badges{
              display: none !important;
            }
          }
        }
      }
    }
  `],
})
export class HomePage {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  discountedProducts: Product[] = [];
  filteredFeaturedProducts: Product[] = [];
  filteredDiscountedProducts: Product[] = [];
  searchTerm = '';
  loading = false;

  constructor() {
    this.categoryService.getCategories().subscribe((categories) => this.categories = categories.filter((category) => category.level === 0).slice(0, 6));
    this.loadHomeProducts();
  }

  onSearch(event: CustomEvent): void {
    const value = (event.detail.value ?? '').trim();
    this.searchTerm = value;
    this.loadHomeProducts();
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.cartService.setPendingItem(product, 1, this.router.url);
      this.router.navigate(['/register'], { queryParams: { redirectTo: this.router.url } });
      return;
    }
    this.cartService.addItem(product, 1);
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.slug], { state: { product } });
  }

  private loadHomeProducts(): void {
    this.loading = true;
    this.productService.getProducts({ search: this.searchTerm, limit: 8, sort: 'latest' }).subscribe((products) => {
      this.featuredProducts = products;
      this.filteredFeaturedProducts = this.featuredProducts;
      this.loading = false;
    });

    this.productService.getProducts({ search: this.searchTerm, limit: 24, sort: 'latest', discountedOnly: true }).subscribe((products) => {
      this.discountedProducts = products.slice(0, 8);
      this.filteredDiscountedProducts = this.discountedProducts;
    });
  }
}
