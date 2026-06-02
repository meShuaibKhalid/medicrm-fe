import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
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
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonIcon, ProductCardComponent],
  template: `
    <ion-content>
      <div class="page-shell listing-shell">
        <div class="dvago-breadcrumb">
          <span routerLink="/home" style="cursor:pointer;">Home</span>
          <ng-container *ngFor="let crumb of categoryPath; let last = last">
            <ion-icon name="chevron-forward-outline"></ion-icon>
            <span *ngIf="!last" [routerLink]="['/categories', crumb.slug, 'products']" style="cursor:pointer;">{{ crumb.name }}</span>
            <span *ngIf="last" style="color: #666; font-weight: 600;">{{ crumb.name }}</span>
          </ng-container>
          <ng-container *ngIf="categoryPath.length === 0">
            <ion-icon name="chevron-forward-outline"></ion-icon>
            <span style="color: #666; font-weight: 600;">{{ pageTitle }}</span>
          </ng-container>
        </div>

        <div class="subcategory-strip" *ngIf="categoryChildren.length">
          <button class="dvago-outlined-chip" *ngFor="let child of categoryChildren" [routerLink]="['/categories', child.slug, 'products']">
            {{ child.name }}
          </button>
        </div>

        <div class="product-grid">
          <app-product-card *ngFor="let product of products" [product]="product" (addToCart)="addToCart($event)" (openProduct)="openProduct($event)"></app-product-card>
        </div>

        <div class="bottom-bar" *ngIf="pagination.total > 0">
          <div class="total-products">
            Showing {{ (currentPage - 1) * pagination.limit + 1 }} - {{ (currentPage - 1) * pagination.limit + products.length }} of {{ pagination.total }} products
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
      </div>
    </ion-content>
  `,
  styles: [`
    .listing-shell {
      padding-top: 12px;
    }
    .subcategory-strip {
      display: flex;
      gap: 14px;
      flex-wrap:wrap;
      padding-bottom: 8px;
      margin-bottom: 18px;
    }
    .filters-card {
      margin-bottom: 18px;
    }
    .bottom-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin: 26px 0 16px;
    }
    @media (min-width: 768px) {
      .bottom-bar {
        flex-direction: row;
        justify-content: space-between;
      }
    }
    .total-products {
      color: #64748b;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .pagination-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
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
  categoryChildren: Category[] = [];
  categoryPath: { name: string, slug: string }[] = [];
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
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params]) => {
      this.categorySlug = params.get('slug') ?? '';
      this.categoryService.getCategories().subscribe((categories) => {
        const flatCategories: Category[] = [];
        const extract = (cats: Category[]) => {
          for (const c of cats) {
            flatCategories.push(c);
            if (c.children) extract(c.children);
          }
        };
        extract(categories);

        const category = flatCategories.find(c => c.slug === this.categorySlug);
        if (category) {
          this.pageTitle = category.name;
          this.categoryChildren = category.children?.length ? category.children : flatCategories.filter(c => c.parentId === category.id);
          
          const path = [{ name: category.name, slug: category.slug }];
          let current = category;
          while (current.parentId) {
            const parent = flatCategories.find(c => c.id === current.parentId);
            if (parent) {
              path.unshift({ name: parent.name, slug: parent.slug });
              current = parent;
            } else {
              break;
            }
          }
          this.categoryPath = path;
        } else {
          this.pageTitle = 'Products';
          this.categoryChildren = [];
          this.categoryPath = [];
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
    this.router.navigate(['/products', product.slug], { state: { product } });
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
