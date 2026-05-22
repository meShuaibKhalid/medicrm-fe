import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSearchbar, IonSelect, IonSelectOption, IonToolbar } from '@ionic/angular/standalone';
import { combineLatest } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Product } from '../../shared/models/app.models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSearchbar, IonSelect, IonSelectOption, IonToolbar, ProductCardComponent],
  template: `
    <ion-header class="ion-no-border dvago-shell">
      <ion-toolbar class="dvago-toolbar">
        <div class="topbar page-shell">
          <div class="brand-block">
            <h1>DVAGO</h1>
            <span>Pharmacy & Wellness Experts</span>
          </div>
          <ion-searchbar class="dvago-searchbar search-block" placeholder="Search for" [(ngModel)]="search" (ionInput)="onSearchChange()"></ion-searchbar>
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
        <div class="page-shell mega-nav-wrap">
          <div class="mega-nav">
            <button
              *ngFor="let category of topCategories"
              type="button"
              class="mega-nav-item"
              [class.active]="activeTopCategory?.id === category.id"
              (mouseenter)="openMegaMenu(category)"
              (focus)="openMegaMenu(category)"
              (click)="toggleMegaMenu(category)">
              <span>{{ category.name }}</span>
              <ion-icon name="chevron-down-outline"></ion-icon>
            </button>
          </div>

          <div class="mega-dropdown" *ngIf="megaMenuOpen && activeTopCategory">
            <div class="mega-column">
              <button
                *ngFor="let item of dropdownPrimary"
                type="button"
                class="mega-link primary"
                [class.selected]="activePrimaryItem?.id === item.id"
                (mouseenter)="setActivePrimary(item)"
                (focus)="setActivePrimary(item)"
                [routerLink]="['/categories', item.slug, 'products']">
                <span>{{ item.name }}</span>
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </button>
            </div>
            <div class="mega-column">
              <button
                *ngFor="let item of dropdownSecondary"
                type="button"
                class="mega-link"
                [routerLink]="['/categories', item.slug, 'products']">
                <span>{{ item.name }}</span>
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </button>
            </div>
            <div class="mega-column">
              <a
                *ngFor="let item of dropdownTertiary"
                class="mega-leaf"
                [routerLink]="['/categories', item.slug, 'products']">
                {{ item.name }}
              </a>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-shell listing-shell" (click)="megaMenuOpen = false">
        <div class="dvago-breadcrumb">
          <span>Home</span>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <span>{{ pageTitle }}</span>
        </div>

        <div class="section-title"><h2>{{ pageTitle }}</h2></div>

        <div class="subcategory-strip" *ngIf="categoryChildren.length">
          <button class="dvago-outlined-chip" *ngFor="let child of categoryChildren" [routerLink]="['/categories', child.slug, 'products']">
            {{ child.name }}
          </button>
        </div>

        <ion-list class="soft-card filters-card">
          <ion-item>
            <ion-label>Sort</ion-label>
            <ion-select [(ngModel)]="sort" (ionChange)="loadProducts(1)">
              <ion-select-option value="latest">Latest</ion-select-option>
              <ion-select-option value="price-low">Price low to high</ion-select-option>
              <ion-select-option value="price-high">Price high to low</ion-select-option>
              <ion-select-option value="name">Name A-Z</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-checkbox slot="start" [(ngModel)]="inStock" (ionChange)="loadProducts(1)"></ion-checkbox>
            <ion-label>In stock</ion-label>
          </ion-item>
          <ion-item>
            <ion-checkbox slot="start" [(ngModel)]="prescriptionRequired" (ionChange)="loadProducts(1)"></ion-checkbox>
            <ion-label>Prescription required</ion-label>
          </ion-item>
          <ion-item>
            <ion-checkbox slot="start" [(ngModel)]="discountedOnly" (ionChange)="loadProducts(1)"></ion-checkbox>
            <ion-label>Discounted only</ion-label>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Min price</ion-label>
            <ion-input type="number" [(ngModel)]="priceMin" (ionBlur)="loadProducts(1)"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Max price</ion-label>
            <ion-input type="number" [(ngModel)]="priceMax" (ionBlur)="loadProducts(1)"></ion-input>
          </ion-item>
        </ion-list>

        <div class="product-grid">
          <app-product-card *ngFor="let product of products" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="pagination-wrap" *ngIf="pagination.totalPages > 1">
          <ion-button fill="clear" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Prev</ion-button>
          <button
            *ngFor="let page of visiblePages"
            type="button"
            class="page-number"
            [class.active]="page === currentPage"
            (click)="goToPage(page)">
            {{ page }}
          </button>
          <ion-button fill="clear" [disabled]="currentPage === pagination.totalPages" (click)="goToPage(currentPage + 1)">Next</ion-button>
        </div>
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
    }
    .green-pill {
      background: #7ea731;
      color: #fff;
      border-color: #7ea731;
    }
    .green-pill ion-icon,
    .primary-pill ion-icon {
      color: #fff;
    }
    .primary-pill {
      background: var(--ion-color-primary);
      color: #fff;
      border-color: var(--ion-color-primary);
    }
    .icon-pill {
      width: 54px;
      justify-content: center;
      padding: 0;
      flex: 0 0 54px;
    }
    .category-toolbar {
      --background: #fff;
      --min-height: 78px;
      overflow: visible;
    }
    .mega-nav-wrap {
      position: relative;
      padding-top: 0;
      padding-bottom: 12px;
    }
    .mega-nav {
      display: flex;
      gap: 16px;
      align-items: center;
      overflow-x: auto;
    }
    .mega-nav-item {
      position: relative;
      min-width: max-content;
      height: 64px;
      padding: 0 18px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;
      font-weight: 600;
      color: #222;
    }
    .mega-nav-item.active {
      border-color: var(--ion-color-secondary);
      box-shadow: inset 0 0 0 1px var(--ion-color-secondary);
    }
    .mega-nav-item.active::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -14px;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-bottom: 14px solid var(--ion-color-primary);
    }
    .mega-dropdown {
      position: absolute;
      top: calc(100% + 2px);
      left: 120px;
      z-index: 10;
      display: grid;
      grid-template-columns: 315px 315px 315px;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 18px 40px rgba(17, 24, 39, 0.12);
      border: 1px solid #e5e8f0;
      overflow: hidden;
    }
    .mega-column {
      border-right: 1px solid #e5e8f0;
      min-height: 100%;
    }
    .mega-column:last-child {
      border-right: 0;
    }
    .mega-link,
    .mega-leaf {
      min-height: 56px;
      width: 100%;
      padding: 0 24px;
      border: 0;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      font-size: 1rem;
      color: #222;
      border-bottom: 1px solid #edf0f6;
      text-decoration: none;
    }
    .mega-link.primary,
    .mega-link.selected {
      background: var(--ion-color-primary);
      color: #fff;
    }
    .mega-link.primary ion-icon,
    .mega-link.selected ion-icon {
      color: #fff;
    }
    .mega-link ion-icon {
      color: var(--ion-color-primary);
    }
    .listing-shell {
      padding-top: 12px;
    }
    .subcategory-strip {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 18px;
    }
    .filters-card {
      margin-bottom: 18px;
    }
    .product-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:18px;
      margin-top: 16px;
    }
    .pagination-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 26px 0 8px;
      flex-wrap: wrap;
    }
    .page-number {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid #dbe1ef;
      background: #fff;
      color: #334155;
      font-weight: 700;
    }
    .page-number.active {
      background: var(--ion-color-primary);
      color: #fff;
      border-color: var(--ion-color-primary);
    }
    @media (min-width: 992px) {
      .topbar {
        grid-template-columns: 240px minmax(280px, 1fr) 330px auto;
      }
      .product-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
    }
  `],
})
export class CategoryProductsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  pageTitle = 'Products';
  categorySlug = '';
  topCategories: Category[] = [];
  categoryTree: Category[] = [];
  categoryChildren: Category[] = [];
  activeTopCategory?: Category;
  activePrimaryItem?: Category;
  megaMenuOpen = false;
  dropdownPrimary: Category[] = [];
  dropdownSecondary: Category[] = [];
  dropdownTertiary: Category[] = [];
  products: Product[] = [];
  pagination = { page: 1, limit: 18, total: 0, totalPages: 1 };
  currentPage = 1;
  search = '';
  sort: 'latest' | 'price-low' | 'price-high' | 'name' = 'latest';
  inStock = false;
  prescriptionRequired = false;
  discountedOnly = false;
  priceMin?: number;
  priceMax?: number;

  constructor() {
    this.categoryService.getCategoryTree().subscribe((categories) => {
      this.categoryTree = categories;
      this.topCategories = categories.slice(0, 7);
      if (this.topCategories.length) {
        this.openMegaMenu(this.topCategories[0]);
      }
    });

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params]) => {
      this.categorySlug = params.get('slug') ?? '';
      this.categoryService.getCategoryBySlug(this.categorySlug).subscribe((category) => {
        this.pageTitle = category?.name ?? 'Products';
        const matchedTop = this.categoryTree.find((item) => item.slug === this.categorySlug || item.children?.some((child) => child.slug === this.categorySlug));
        this.categoryChildren = matchedTop?.children ?? [];
        if (matchedTop) {
          this.openMegaMenu(matchedTop);
        }
      });
      this.loadProducts(1);
    });
  }

  loadProducts(page = this.currentPage): void {
    this.currentPage = page;
    this.productService.getProductsPage({
      categorySlug: this.categorySlug,
      includeDescendants: true,
      search: this.search,
      inStock: this.inStock,
      prescriptionRequired: this.prescriptionRequired ? true : undefined,
      discountedOnly: this.discountedOnly,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      sort: this.sort,
      limit: 18,
      page,
    }).subscribe((response) => {
      this.products = response.items;
      this.pagination = response.pagination;
    });
  }

  onSearchChange(): void {
    this.loadProducts(1);
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

  openMegaMenu(category: Category): void {
    this.activeTopCategory = category;
    this.dropdownPrimary = category.children ?? [];
    this.activePrimaryItem = this.dropdownPrimary[0];
    this.dropdownSecondary = this.activePrimaryItem?.children?.length ? this.activePrimaryItem.children : this.dropdownPrimary.slice(0, 10);
    this.dropdownTertiary = this.dropdownSecondary.slice(0, 10);
    this.megaMenuOpen = true;
  }

  toggleMegaMenu(category: Category): void {
    if (this.activeTopCategory?.id === category.id && this.megaMenuOpen) {
      this.megaMenuOpen = false;
      return;
    }
    this.openMegaMenu(category);
  }

  setActivePrimary(category: Category): void {
    this.activePrimaryItem = category;
    this.dropdownSecondary = category.children?.length ? category.children : this.dropdownPrimary.slice(0, 10);
    this.dropdownTertiary = this.dropdownSecondary.slice(0, 10);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages || page === this.currentPage) {
      return;
    }
    this.loadProducts(page);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.pagination.totalPages, start + 4);
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }
}
