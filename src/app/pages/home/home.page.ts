import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Category, Product } from '../../shared/models/app.models';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar, CategoryCardComponent, ProductCardComponent],
  template: `
    <ion-header class="ion-no-border dvago-shell">
      <ion-toolbar class="dvago-toolbar">
        <div class="topbar page-shell">
          <div class="brand-block">
            <h1>DVAGO</h1>
            <span>Pharmacy & Wellness Experts</span>
          </div>

          <ion-searchbar class="dvago-searchbar search-block" placeholder='Search for "Personal Care"' [value]="searchTerm" (ionInput)="onSearch($event)"></ion-searchbar>

          <button class="utility-pill address-pill" type="button">
            <ion-icon name="location-outline"></ion-icon>
            <span>No Address Selected</span>
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>

          <div class="action-pills">
            <button class="utility-pill green-pill" type="button">
              <ion-icon name="apps-outline"></ion-icon>
              <span>Download the App</span>
            </button>
            <button class="utility-pill primary-pill" type="button">
              <ion-icon name="radio-button-on-outline"></ion-icon>
              <span>Instant Order</span>
            </button>
            <button class="icon-pill" type="button" routerLink="/profile"><ion-icon name="person-outline"></ion-icon></button>
            <button class="icon-pill" type="button"><ion-icon name="heart-outline"></ion-icon></button>
            <button class="icon-pill" type="button" routerLink="/cart"><ion-icon name="cart-outline"></ion-icon></button>
          </div>
        </div>
      </ion-toolbar>
      <ion-toolbar class="category-toolbar">
        <div class="page-shell nav-scroll">
          <app-category-card *ngFor="let category of categories" [category]="category"></app-category-card>
          <ion-button class="nav-link-btn" fill="clear">OTC And Health Need <ion-icon slot="end" name="chevron-down-outline"></ion-icon></ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-shell homepage-shell">
        <ion-card class="hero soft-card">
          <ion-card-content>
            <ion-badge color="success">Fast delivery</ion-badge>
            <h2>Order medicines online</h2>
            <p>Shop pharmacy products, daily essentials, and health support with a cleaner storefront inspired by the reference layout.</p>
            <ion-button shape="round" routerLink="/categories">Shop Now</ion-button>
          </ion-card-content>
        </ion-card>

        <div class="section-title"><h2>Trending Categories</h2></div>
        <div class="dvago-chip-list">
          <button class="dvago-outlined-chip" *ngFor="let category of categories" [routerLink]="['/categories', category.slug, 'products']">{{ category.name }}</button>
        </div>

        <div class="section-title"><h2>Featured Products</h2></div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredFeaturedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="section-title"><h2>Discounted Products</h2></div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredDiscountedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="section-title"><h2>Devices & Support</h2></div>
        <ion-list class="soft-card info-list">
          <ion-item lines="none">
            <ion-icon slot="start" name="medical-outline" color="secondary"></ion-icon>
            <ion-label>Diabetes accessories and daily wellness devices</ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-icon slot="start" name="shield-checkmark-outline" color="secondary"></ion-icon>
            <ion-label>Trusted brands and simple refill-friendly ordering</ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    .topbar {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: center;
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
      border: 0;
      background: #fff;
      min-height: 54px;
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 18px;
      font-weight: 700;
      color: #222;
      border: 1px solid #e3e6ef;
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
    }
    .action-pills::-webkit-scrollbar,
    .nav-scroll::-webkit-scrollbar {
      display: none;
    }
    .green-pill {
      background: #7ea731;
      color: #fff;
      border-color: #7ea731;
    }
    .green-pill ion-icon {
      color: #fff;
    }
    .primary-pill {
      background: var(--ion-color-primary);
      color: #fff;
      border-color: var(--ion-color-primary);
    }
    .primary-pill ion-icon {
      color: #fff;
    }
    .icon-pill {
      width: 54px;
      justify-content: center;
      padding: 0;
      flex: 0 0 54px;
    }
    .category-toolbar {
      --background: #fff;
      --min-height: 68px;
    }
    .nav-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      align-items: center;
      padding-top: 0;
      padding-bottom: 10px;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
    }
    .nav-link-btn {
      --color: #222;
      text-transform: none;
      font-weight: 600;
      min-width: max-content;
    }
    .homepage-shell {
      padding-top: 12px;
    }
    .hero {
      margin: 8px 0 26px;
      background: linear-gradient(135deg, #fff6f8, #ffffff);
      color: #2e2e2e;
      border-radius: 20px;
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
    .product-grid {
      display:grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }
    .info-list {
      overflow: hidden;
    }
    @media (min-width: 992px) {
      .topbar {
        grid-template-columns: 240px minmax(280px, 1fr) 330px auto;
      }
      .product-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    @media (min-width: 1280px) {
      .product-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
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
    this.router.navigate(['/products', product.slug]);
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
