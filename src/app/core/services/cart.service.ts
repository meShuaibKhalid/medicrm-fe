import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Cart, CartItem, Product } from '../../shared/models/app.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.models';

interface PendingCartItem {
  product: Product;
  quantity: number;
  returnUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly pendingStorageKey = 'pharmago_pending_cart_item';
  private readonly guestStorageKey = 'pharmago_guest_cart';
  private readonly cartSubject = new BehaviorSubject<Cart>(this.calculateTotals([]));
  readonly cart$ = this.cartSubject.asObservable();

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.syncGuestCart();
      } else {
        this.loadGuestCart();
      }
    });
  }

  private loadGuestCart() {
    const raw = localStorage.getItem(this.guestStorageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.cartSubject.next(this.calculateTotals(parsed));
      } catch {
        this.cartSubject.next(this.calculateTotals([]));
      }
    } else {
      this.cartSubject.next(this.calculateTotals([]));
    }
  }

  private saveGuestCart(items: CartItem[]) {
    localStorage.setItem(this.guestStorageKey, JSON.stringify(items));
    this.cartSubject.next(this.calculateTotals(items));
  }

  private syncGuestCart() {
    const raw = localStorage.getItem(this.guestStorageKey);
    const guestItems: CartItem[] = raw ? JSON.parse(raw) : [];

    this.http.get<ApiResponse<any>>(`${environment.apiUrl}/cart`).pipe(
      map((res) => this.mapBackendCart(res.data))
    ).subscribe((cart) => {
      let pendingCount = guestItems.length;

      if (pendingCount === 0) {
        this.cartSubject.next(cart);
        return;
      }

      guestItems.forEach((item) => {
        const exists = cart.items.find(ci => ci.product.id === item.product.id);
        const qtyToAdd = exists ? Math.max(0, item.quantity - exists.quantity) : item.quantity;
        
        if (qtyToAdd > 0) {
          this.http.post<ApiResponse<any>>(`${environment.apiUrl}/cart/items`, { productId: item.product.id, quantity: qtyToAdd }).subscribe({
            next: (res) => {
              pendingCount--;
              if (pendingCount === 0) {
                this.cartSubject.next(this.mapBackendCart(res.data));
                localStorage.removeItem(this.guestStorageKey);
              }
            },
            error: () => {
              pendingCount--;
              if (pendingCount === 0) {
                this.loadCartFromBackend();
                localStorage.removeItem(this.guestStorageKey);
              }
            }
          });
        } else {
          pendingCount--;
          if (pendingCount === 0) {
            this.cartSubject.next(cart);
            localStorage.removeItem(this.guestStorageKey);
          }
        }
      });
    });
  }

  loadCartFromBackend(): void {
    this.http.get<ApiResponse<any>>(`${environment.apiUrl}/cart`).pipe(
      map((res) => this.mapBackendCart(res.data))
    ).subscribe((cart) => this.cartSubject.next(cart));
  }

  getCart() {
    return this.cart$;
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addItem(product: Product, quantity = 1): void {
    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<any>>(`${environment.apiUrl}/cart/items`, { productId: product.id, quantity }).pipe(
        map((res) => this.mapBackendCart(res.data))
      ).subscribe((cart) => this.cartSubject.next(cart));
    } else {
      const items = [...this.cartSubject.value.items];
      const existing = items.find((item) => item.product.id === product.id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.maxOrder);
        existing.lineTotal = existing.quantity * (existing.salePrice ?? existing.price);
        existing.discountAmount = (existing.price - (existing.salePrice ?? existing.price)) * existing.quantity;
      } else {
        const salePrice = product.salePrice ?? product.price;
        items.push({
          product,
          quantity: Math.min(quantity, product.maxOrder),
          price: product.price,
          salePrice,
          discountAmount: (product.price - salePrice) * quantity,
          lineTotal: salePrice * quantity,
        });
      }

      this.saveGuestCart(items);
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    if (this.authService.isLoggedIn()) {
      this.http.patch<ApiResponse<any>>(`${environment.apiUrl}/cart/items/${productId}`, { quantity }).pipe(
        map((res) => this.mapBackendCart(res.data))
      ).subscribe((cart) => this.cartSubject.next(cart));
    } else {
      const items = this.cartSubject.value.items.map((item) => {
        if (item.product.id !== productId) {
          return item;
        }

        const nextQuantity = Math.max(1, Math.min(quantity, item.product.maxOrder));
        return {
          ...item,
          quantity: nextQuantity,
          discountAmount: (item.price - (item.salePrice ?? item.price)) * nextQuantity,
          lineTotal: (item.salePrice ?? item.price) * nextQuantity,
        };
      });

      this.saveGuestCart(items);
    }
  }

  removeItem(productId: string): void {
    if (this.authService.isLoggedIn()) {
      this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/cart/items/${productId}`).pipe(
        map((res) => this.mapBackendCart(res.data))
      ).subscribe((cart) => this.cartSubject.next(cart));
    } else {
      const items = this.cartSubject.value.items.filter((item) => item.product.id !== productId);
      this.saveGuestCart(items);
    }
  }

  clearCart(): void {
    if (this.authService.isLoggedIn()) {
      this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/cart`).pipe(
        map((res) => this.mapBackendCart(res.data))
      ).subscribe((cart) => this.cartSubject.next(cart));
    } else {
      this.saveGuestCart([]);
    }
  }

  setPendingItem(product: Product, quantity: number, returnUrl: string): void {
    const payload: PendingCartItem = { product, quantity, returnUrl };
    localStorage.setItem(this.pendingStorageKey, JSON.stringify(payload));
  }

  getPendingItem(): PendingCartItem | null {
    const raw = localStorage.getItem(this.pendingStorageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as PendingCartItem;
    } catch {
      localStorage.removeItem(this.pendingStorageKey);
      return null;
    }
  }

  consumePendingItem(): PendingCartItem | null {
    const pendingItem = this.getPendingItem();
    localStorage.removeItem(this.pendingStorageKey);
    return pendingItem;
  }

  calculateTotals(items: CartItem[]): Cart {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotal = items.reduce((sum, item) => sum + item.discountAmount, 0);
    const deliveryFee = items.length ? 149 : 0;
    const grandTotal = subtotal - discountTotal + deliveryFee;

    return { items, subtotal, discountTotal, deliveryFee, grandTotal };
  }

  private mapBackendCart(backendCart: any): Cart {
    const items = (backendCart.items || []).map((item: any) => {
      const productRaw = item.productId || {};
      const product: Product = {
        id: String(productRaw._id || productRaw.id || ''),
        title: productRaw.title || '',
        slug: productRaw.slug || '',
        description: productRaw.description || '',
        image: productRaw.image || '',
        brand: productRaw.brand || '',
        price: Number(productRaw.price || item.price || 0),
        salePrice: Number(productRaw.salePrice || item.salePrice || 0),
        salePercent: Number(productRaw.salePercent || 0),
        stock: Number(productRaw.stock || 0),
        maxOrder: Number(productRaw.maxOrder || 10),
        prescriptionRequired: Boolean(productRaw.prescriptionRequired),
        usedFor: productRaw.usedFor || '',
        categoryIds: [],
        primaryCategoryId: '',
        isActive: true,
      };

      return {
        product,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice,
        discountAmount: item.discountAmount,
        lineTotal: item.lineTotal,
      };
    });

    return {
      items,
      subtotal: backendCart.subtotal || 0,
      discountTotal: backendCart.discountTotal || 0,
      deliveryFee: backendCart.deliveryFee || 0,
      grandTotal: backendCart.grandTotal || 0,
    };
  }
}
