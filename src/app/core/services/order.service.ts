import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Order, OrderStatus } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  readonly orders$ = this.ordersSubject.asObservable();
  private latestOrder: Order | null = null;

  createOrder(payload: { addressId: string, customerNote?: string, prescriptionUrl?: string }): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}`, payload).pipe(
      map(res => {
        const order = res.data;
        if (order._id && !order.id) {
          order.id = order._id;
        }
        return order;
      }),
      tap(order => {
        this.ordersSubject.next([order, ...this.ordersSubject.value]);
        this.latestOrder = order;
      })
    );
  }

  fetchMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my`).pipe(
      map(res => res.data.map(o => ({ ...o, id: o._id || o.id }))),
      tap(orders => this.ordersSubject.next(orders))
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getCurrentOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getOrderById(id: string): Observable<Order> {
    // Optimistic cache check
    const existing = this.ordersSubject.value.find(o => o.id === id);
    if (existing) {
      return of(existing);
    }
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        const order = res.data;
        if (order._id && !order.id) {
          order.id = order._id;
        }
        return order;
      })
    );
  }

  getLatestOrder(): Order | null {
    return this.latestOrder;
  }
}
