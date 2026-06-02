import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Brand, Product } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from './api.models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/brands`;

  getBrands(): Observable<Brand[]> {
    return this.http.get<ApiResponse<any[]>>(this.baseUrl).pipe(
      map((response) => response.data.map((brand) => this.mapBrand(brand))),
    );
  }

  getBrandBySlug(slug: string): Observable<Brand | undefined> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${slug}`).pipe(
      map((response) => this.mapBrand(response.data)),
    );
  }

  getBrandProducts(slug: string, params?: { page?: number; limit?: number; sort?: 'latest' | 'price-low' | 'price-high' | 'name' }): Observable<PaginatedResult<Product>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    let httpParams = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit))
      .set('sort', params?.sort ?? 'latest');

    return this.http.get<ApiResponse<PaginatedResult<any>>>(`${this.baseUrl}/${slug}/products`, { params: httpParams }).pipe(
      map((response) => ({
        items: response.data.items.map((product) => ({ ...product, id: product._id || product.id })),
        pagination: response.data.pagination,
      })),
    );
  }

  private mapBrand(brand: any): Brand {
    return {
      id: String(brand._id ?? brand.id),
      name: brand.name ?? '',
      slug: brand.slug ?? '',
      isActive: Boolean(brand.isActive),
      createdAt: brand.createdAt,
    };
  }
}
