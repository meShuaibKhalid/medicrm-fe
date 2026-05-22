import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Category, Order, OrderStatus, Product, User } from '../../shared/models/app.models';
import { MOCK_CATEGORIES, MOCK_USERS } from '../../shared/data/mock-data';
import { ProductService } from './product.service';
import { OrderService } from './order.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  getDashboardStats(): Observable<{ label: string; value: number }[]> {
    return this.productService.getProducts().pipe(
      map((products) => {
        const orders = this.orderService.getCurrentOrders();
        return [
          { label: 'Total products', value: products.length },
          { label: 'Total orders', value: orders.length },
          { label: 'Pending orders', value: orders.filter((order) => order.status === 'pending').length },
          { label: 'Completed orders', value: orders.filter((order) => order.status === 'completed').length },
          { label: 'Total users', value: MOCK_USERS.filter((user) => user.role === 'customer').length },
          { label: 'Low stock products', value: products.filter((product) => product.stock < 20).length },
        ];
      }),
    );
  }

  getUsers(): Observable<User[]> {
    return of(MOCK_USERS);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<boolean> {
    const user = MOCK_USERS.find((item) => item.id === id);
    if (user) {
      user.isActive = isActive;
    }
    return of(true);
  }

  getOrders(): Observable<Order[]> {
    return this.orderService.getMyOrders();
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order | undefined> {
    return this.orderService.updateOrderStatus(id, status);
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
