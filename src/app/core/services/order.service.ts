import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cart, Order, OrderStatus } from '../../shared/models/app.models';
import { MOCK_ORDERS } from '../../shared/data/mock-data';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly authService = inject(AuthService);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([...MOCK_ORDERS]);
  readonly orders$ = this.ordersSubject.asObservable();
  private latestOrder: Order | null = null;

  createOrder(cart: Cart, address: Order['address']): Observable<Order> {
    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `DVG-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'pending',
      paymentMethod: 'Cash on Delivery',
      user: this.authService.getCurrentUserSnapshot() ?? undefined,
      items: cart.items,
      address,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      deliveryFee: cart.deliveryFee,
      grandTotal: cart.grandTotal,
      createdAt: new Date().toISOString(),
    };
    this.ordersSubject.next([order, ...this.ordersSubject.value]);
    this.latestOrder = order;
    return of(order);
  }

  getMyOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getCurrentOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getOrderById(id: string): Observable<Order | undefined> {
    return of(this.ordersSubject.value.find((order) => order.id === id));
  }

  getLatestOrder(): Order | null {
    return this.latestOrder;
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order | undefined> {
    let updated: Order | undefined;
    const next = this.ordersSubject.value.map((order) => {
      if (order.id !== id) {
        return order;
      }
      updated = { ...order, status };
      return updated;
    });
    this.ordersSubject.next(next);
    return of(updated);
  }
}
