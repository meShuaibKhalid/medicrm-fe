import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Category, Order, OrderStatus, Product, User } from '../../shared/models/app.models';
import { MOCK_CATEGORIES } from '../../shared/data/mock-data';
import { ProductService } from './product.service';
import { OrderService } from './order.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<{ label: string; value: number }[]> {
    return forkJoin({
      products: this.productService.getProducts(),
      orders: this.getOrders(),
      users: this.getUsers(),
    }).pipe(
      map(({ products, orders, users }) => {
        return [
          { label: 'Total products', value: products.length },
          { label: 'Total orders', value: orders.length },
          { label: 'Pending orders', value: orders.filter((order) => order.status === 'pending').length },
          { label: 'Completed orders', value: orders.filter((order) => order.status === 'completed').length },
          { label: 'Total users', value: users.filter((user) => user.role === 'user').length },
          { label: 'Low stock products', value: products.filter((product) => product.stock < 20).length },
        ];
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/users`).pipe(
      map((res) => res.data.map((u: any) => ({ ...u, id: u._id || u.id })))
    );
  }

  updateUserStatus(id: string, isActive: boolean): Observable<boolean> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/users/${id}/status`, { isActive }).pipe(map(() => true));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/orders`).pipe(
      map((res) => res.data.map((o: any) => ({ ...o, id: o._id || o.id })))
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order | undefined> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/status`, { status }).pipe(
      map((res) => ({ ...res.data, id: res.data._id || res.data.id }))
    );
  }

  createProduct(product: Product): Observable<Product> {
    return of(product);
  }

  updateProduct(product: Product): Observable<Product> {
    return of(product);
  }

  deleteProduct(_id: string): Observable<boolean> {
    return of(true);
  }

  createCategory(category: Category): Observable<Category> {
    return of(category);
  }

  updateCategory(category: Category): Observable<Category> {
    return of(category);
  }

  deleteCategory(_id: string): Observable<boolean> {
    return of(true);
  }
}
