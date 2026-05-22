import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from './api.models';
import { MOCK_PRODUCTS } from '../../shared/data/mock-data';

export interface ProductQueryParams {
  categorySlug?: string | null;
  search?: string;
  inStock?: boolean;
  prescriptionRequired?: boolean;
  discountedOnly?: boolean;
  brand?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  sort?: 'latest' | 'price-low' | 'price-high' | 'name';
  page?: number;
  limit?: number;
  includeDescendants?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getProducts(params?: ProductQueryParams): Observable<Product[]> {
    return this.getProductsPage(params).pipe(map((response) => response.items));
  }

  getProductsPage(params?: ProductQueryParams): Observable<PaginatedResult<Product>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const requiresClientPagination = Boolean(params?.search?.trim() || params?.discountedOnly || params?.brand?.trim());

    if (requiresClientPagination) {
      return this.fetchProducts({
        ...params,
        page: 1,
        limit: 200,
      }).pipe(
        map((products) => {
          const start = (page - 1) * limit;
          const items = products.slice(start, start + limit);
          return {
            items,
            pagination: {
              page,
              limit,
              total: products.length,
              totalPages: Math.max(1, Math.ceil(products.length / limit)),
            },
          };
        }),
      );
    }

    let httpParams = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit))
      .set('sort', this.mapSort(params?.sort));

    if (params?.categorySlug) {
      httpParams = httpParams.set('categorySlug', params.categorySlug);
      httpParams = httpParams.set('includeDescendants', String(params.includeDescendants ?? true));
    }
    if (params?.inStock) {
      httpParams = httpParams.set('inStock', 'true');
    }
    if (params?.prescriptionRequired !== undefined) {
      httpParams = httpParams.set('prescriptionRequired', String(params.prescriptionRequired));
    }
    if (params?.priceMin !== null && params?.priceMin !== undefined) {
      httpParams = httpParams.set('minPrice', String(params.priceMin));
    }
    if (params?.priceMax !== null && params?.priceMax !== undefined) {
      httpParams = httpParams.set('maxPrice', String(params.priceMax));
    }

    return this.http.get<ApiResponse<PaginatedResult<any>>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        items: this.applyClientFilters(response.data.items.map((product) => this.mapProduct(product)), params),
        pagination: response.data.pagination,
      })),
      catchError(() => {
        const filtered = this.applyClientFilters(MOCK_PRODUCTS, params);
        const start = (page - 1) * limit;
        return of({
          items: filtered.slice(start, start + limit),
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
          },
        });
      }),
    );
  }

  private fetchProducts(params?: ProductQueryParams): Observable<Product[]> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 1))
      .set('limit', String(params?.limit ?? 20))
      .set('sort', this.mapSort(params?.sort));

    if (params?.categorySlug) {
      httpParams = httpParams.set('categorySlug', params.categorySlug);
      httpParams = httpParams.set('includeDescendants', String(params.includeDescendants ?? true));
    }
    if (params?.inStock) {
      httpParams = httpParams.set('inStock', 'true');
    }
    if (params?.prescriptionRequired !== undefined) {
      httpParams = httpParams.set('prescriptionRequired', String(params.prescriptionRequired));
    }
    if (params?.priceMin !== null && params?.priceMin !== undefined) {
      httpParams = httpParams.set('minPrice', String(params.priceMin));
    }
    if (params?.priceMax !== null && params?.priceMax !== undefined) {
      httpParams = httpParams.set('maxPrice', String(params.priceMax));
    }

    return this.http.get<ApiResponse<PaginatedResult<any>>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => response.data.items.map((product) => this.mapProduct(product))),
      map((products) => this.applyClientFilters(products, params)),
      catchError(() => of(this.applyClientFilters(MOCK_PRODUCTS, params))),
    );
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/${slug}`)
      .pipe(map((response) => this.mapProduct(response.data)));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.getProducts({ limit: 8, sort: 'latest' }).pipe(map((products) => products.slice(0, 8)));
  }

  getDiscountedProducts(): Observable<Product[]> {
    return this.getProducts({ limit: 24, sort: 'latest', includeDescendants: true }).pipe(
      map((products) => products.filter((product) => (product.salePercent ?? 0) > 0).slice(0, 8)),
    );
  }

  private applyClientFilters(products: Product[], params?: ProductQueryParams): Product[] {
    let filtered = [...products];

    if (params?.search?.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.usedFor.toLowerCase().includes(term),
      );
    }

    if (params?.discountedOnly) {
      filtered = filtered.filter((product) => (product.salePercent ?? 0) > 0);
    }

    if (params?.brand?.trim()) {
      const brand = params.brand.trim().toLowerCase();
      filtered = filtered.filter((product) => product.brand.toLowerCase().includes(brand));
    }

    return filtered;
  }

  private mapSort(sort?: ProductQueryParams['sort']): string {
    switch (sort) {
      case 'price-low':
        return 'price_asc';
      case 'price-high':
        return 'price_desc';
      case 'name':
        return 'title_asc';
      default:
        return 'latest';
    }
  }

  private mapProduct(product: any): Product {
    return {
      id: String(product._id ?? product.id),
      title: product.title ?? '',
      slug: product.slug ?? '',
      description: product.description ?? '',
      image: product.image ?? '',
      brand: product.brand ?? '',
      price: Number(product.price ?? 0),
      salePrice: Number(product.salePrice ?? product.price ?? 0),
      salePercent: Number(product.salePercent ?? 0),
      stock: Number(product.stock ?? 0),
      maxOrder: Number(product.maxOrder ?? 0),
      prescriptionRequired: Boolean(product.prescriptionRequired),
      usedFor: product.usedFor ?? '',
      categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds.map((id: unknown) => String(id)) : [],
      primaryCategoryId: String(product.primaryCategoryId ?? ''),
      isActive: Boolean(product.isActive),
    };
  }
}
