import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem, Product } from '../../shared/models/app.models';

interface PendingCartItem {
  product: Product;
  quantity: number;
  returnUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly pendingStorageKey = 'pharmago_pending_cart_item';
  private readonly cartSubject = new BehaviorSubject<Cart>(this.calculateTotals([]));
  readonly cart$ = this.cartSubject.asObservable();

  getCart() {
    return this.cart$;
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addItem(product: Product, quantity = 1): void {
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

    this.cartSubject.next(this.calculateTotals(items));
  }

  updateQuantity(productId: string, quantity: number): void {
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

    this.cartSubject.next(this.calculateTotals(items));
  }

  removeItem(productId: string): void {
    const items = this.cartSubject.value.items.filter((item) => item.product.id !== productId);
    this.cartSubject.next(this.calculateTotals(items));
  }

  clearCart(): void {
    this.cartSubject.next(this.calculateTotals([]));
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
}
