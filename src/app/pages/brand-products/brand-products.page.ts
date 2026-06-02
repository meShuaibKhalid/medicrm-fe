import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { Brand, Product } from '../../shared/models/app.models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-brand-products',
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonContent, IonIcon, ProductCardComponent],
  template: `
    <ion-content>
      <div class="page-shell listing-shell">
        <div class="dvago-breadcrumb">
          <span routerLink="/home" style="cursor:pointer;">Home</span>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <span style="color: #666; font-weight: 600;">{{ brand?.name || 'Brand' }}</span>
        </div>

        <div class="brand-hero soft-card">
          <p class="eyebrow">Brand</p>
          <h2>{{ brand?.name || 'Loading brand...' }}</h2>
          <p *ngIf="brand">Products from {{ brand.name }}</p>
        </div>

        <div class="product-grid" *ngIf="!loading && !loadError">
          <app-product-card *ngFor="let product of products" [product]="product"></app-product-card>
        </div>

        <div class="state-card" *ngIf="loading">Loading products...</div>
        <div class="state-card error-card" *ngIf="!loading && loadError">{{ loadError }}</div>

        <div class="bottom-bar" *ngIf="pagination.total > 0">
          <div class="total-products">
            Showing {{ (currentPage - 1) * pagination.limit + 1 }} - {{ (currentPage - 1) * pagination.limit + products.length }} of {{ pagination.total }} products
          </div>
          <div class="pagination-wrap" *ngIf="pagination.totalPages > 1">
            <ion-button fill="clear" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Prev</ion-button>
            <span class="page-info">Page {{ currentPage }} of {{ pagination.totalPages }}</span>
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
    .dvago-breadcrumb {
      display: flex;
      gap: 10px;
      align-items: center;
      color: var(--ion-color-primary);
      font-size: 1rem;
      margin: 10px 0 22px;
    }
    .brand-hero {
      padding: 20px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #f7fbfa 0%, #eef7ff 100%);
      border-radius: 20px;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.75rem;
      color: #7a8c98;
      margin: 0 0 8px;
    }
    .brand-hero h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #173d52;
    }
    .brand-hero p {
      margin: 8px 0 0;
      color: #5f7380;
    }
    .product-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:18px;
      margin-top: 16px;
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
    .total-products, .state-card {
      color: #64748b;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .error-card {
      color: #b42318;
      margin-top: 16px;
    }
    .pagination-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .page-info {
      color: #334155;
      font-weight: 600;
    }
    @media (min-width: 992px) {
      .product-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `],
})
export class BrandProductsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly brandService = inject(BrandService);
  private readonly productService = inject(ProductService);

  brand?: Brand;
  brandSlug = '';
  products: Product[] = [];
  pagination = { page: 1, limit: 18, total: 0, totalPages: 1 };
  currentPage = 1;
  loading = true;
  loadError = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.brandSlug = params.get('slug') ?? '';
      this.currentPage = 1;
      this.loading = true;
      this.loadError = '';

      this.brandService.getBrandBySlug(this.brandSlug).subscribe({
        next: (brand) => {
          if (!brand) {
            this.brand = undefined;
            this.loading = false;
            this.loadError = 'Brand not found.';
            return;
          }

          this.brand = brand;
          this.loadProducts(1);
        },
        error: () => {
          this.brand = undefined;
          this.loading = false;
          this.loadError = 'Brand not found.';
        },
      });
    });
  }

  loadProducts(page = this.currentPage): void {
    this.currentPage = page;
    this.productService.getProductsPage({
      brandSlug: this.brandSlug,
      page,
      limit: this.pagination.limit,
      sort: 'latest',
    }).subscribe((response) => {
      this.products = response.items;
      this.pagination = response.pagination;
      this.loading = false;
    });
  }

  goToPage(page: number): void {
    this.router.navigate(['/brand', this.brandSlug], { queryParams: { page } });
    this.loadProducts(page);
  }
}
