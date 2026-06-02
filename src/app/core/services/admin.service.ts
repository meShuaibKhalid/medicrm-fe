import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category, Order, OrderStatus, Product, User } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from './api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<{ label: string; value: number }[]> {
    return this.http.get<ApiResponse<{ label: string; value: number }[]>>(`${this.baseUrl}/stats`).pipe(
      map((res) => res.data)
    );
  }

  getUsers(params?: { search?: string; page?: number; limit?: number }): Observable<PaginatedResult<User>> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 1))
      .set('limit', String(params?.limit ?? 20));
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<ApiResponse<PaginatedResult<any>>>(`${this.baseUrl}/users`, { params: httpParams }).pipe(
      map((res) => ({
        items: res.data.items.map((u: any) => ({ ...u, id: u._id || u.id })),
        pagination: res.data.pagination,
      }))
    );
  }

  updateUserStatus(id: string, isActive: boolean): Observable<boolean> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/users/${id}/status`, { isActive }).pipe(map(() => true));
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${id}`).pipe(map(() => true));
  }

  getOrders(params?: { search?: string; status?: string; page?: number; limit?: number }): Observable<PaginatedResult<Order>> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 1))
      .set('limit', String(params?.limit ?? 20));
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ApiResponse<PaginatedResult<any>>>(`${this.baseUrl}/orders`, { params: httpParams }).pipe(
      map((res) => ({
        items: res.data.items.map((o: any) => ({ ...o, id: o._id || o.id })),
        pagination: res.data.pagination,
      }))
    );
  }

  getAdminProducts(params?: { search?: string; page?: number; limit?: number }): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 1))
      .set('limit', String(params?.limit ?? 20));
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<ApiResponse<PaginatedResult<any>>>(`${this.baseUrl}/products`, { params: httpParams }).pipe(
      map((res) => ({
        items: res.data.items.map((p: any) => ({ ...p, id: p._id || p.id })),
        pagination: res.data.pagination,
      }))
    );
  }

  getAdminCategories(params?: { search?: string; page?: number; limit?: number }): Observable<PaginatedResult<Category>> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 1))
      .set('limit', String(params?.limit ?? 20));
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<ApiResponse<PaginatedResult<any>>>(`${this.baseUrl}/categories`, { params: httpParams }).pipe(
      map((res) => ({
        items: res.data.items.map((c: any) => ({ ...c, id: c._id || c.id })),
        pagination: res.data.pagination,
      }))
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order | undefined> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/status`, { status }).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  createProduct(product: Product | FormData): Observable<Product> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/products`, product).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  updateProduct(product: Product | FormData, productId?: string): Observable<Product> {
    const id = productId ?? (product instanceof FormData ? '' : product.id);
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/products/${id}`, product).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  deleteProduct(_id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/products/${_id}`).pipe(map(() => true));
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/categories`, category).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/categories/${category.id}`, category).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  deleteCategory(_id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/categories/${_id}`).pipe(map(() => true));
  }
}
