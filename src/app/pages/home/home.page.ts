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
            <ion-button shape="round" routerLink="/categories">Shop Now</ion-button>
          </ion-card-content>
        </ion-card>

        <div class="section-title">
          <h2>Trending Categories</h2>
          <button>View All</button>
        </div>
        <div class="dvago-chip-list">
          <button class="dvago-outlined-chip" *ngFor="let category of categories" [routerLink]="['/categories', category.slug, 'products']">{{ category.name }}</button>
        </div>

        <div class="section-title">
          <h2>Featured Products</h2>
          <button>View All</button>
        </div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredFeaturedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="section-title">
          <h2>Discounted Products</h2>
        <button>View All</button></div>
        <div class="product-grid">
          <app-product-card *ngFor="let product of filteredDiscountedProducts" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="section-title">
          <h2>Devices & Support</h2>
      <button>View All</button></div>
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
      background-color: var(--ion-color-primary) !important;
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

    :host ::ng-deep{
      ion-searchbar{
        input{
          background: transparent !important;
          font-size: 12px !important  ;
        }
      }
    }

    @media (min-width: 992px) {
      // .topbar {
      //   grid-template-columns: 240px minmax(280px, 1fr) 330px auto;
      // }
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
