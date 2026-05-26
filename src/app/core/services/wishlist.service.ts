import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Product, Wishlist, WishlistItem } from '../../shared/models/app.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.models';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly guestStorageKey = 'pharmago_guest_wishlist';
  private readonly wishlistSubject = new BehaviorSubject<Wishlist>({ items: [] });
  readonly wishlist$ = this.wishlistSubject.asObservable();

  constructor() { 
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.syncGuestWishlist();
      } else {
        this.loadGuestWishlist();
      }
    });
  }

  getWishlist() {
    return this.wishlist$;
  }

  getCurrentWishlist(): Wishlist {
    return this.wishlistSubject.value;
  }

  private loadGuestWishlist() {
    const raw = localStorage.getItem(this.guestStorageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.wishlistSubject.next({ items: parsed });
      } catch {
        this.wishlistSubject.next({ items: [] });
      }
    } else {
      this.wishlistSubject.next({ items: [] });
    }
  }

  private saveGuestWishlist(items: WishlistItem[]) {
    localStorage.setItem(this.guestStorageKey, JSON.stringify(items));
    this.wishlistSubject.next({ items });
  }

  private syncGuestWishlist() {
    const raw = localStorage.getItem(this.guestStorageKey);
    const guestItems: WishlistItem[] = raw ? JSON.parse(raw) : [];

    this.http.get<ApiResponse<any>>(`${environment.apiUrl}/wishlist`).pipe(
      map((res) => this.mapBackendWishlist(res.data))
    ).subscribe((wishlist) => {
      let pendingCount = guestItems.length;

      if (pendingCount === 0) {
        this.wishlistSubject.next(wishlist);
        return;
      }

      guestItems.forEach((item) => {
        const exists = wishlist.items.some(wi => wi.product.id === item.product.id);
        if (!exists) {
          this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wishlist/items`, { productId: item.product.id }).subscribe({
            next: (res) => {
              pendingCount--;
              if (pendingCount === 0) {
                this.wishlistSubject.next(this.mapBackendWishlist(res.data));
                localStorage.removeItem(this.guestStorageKey);
              }
            },
            error: () => {
              pendingCount--;
              if (pendingCount === 0) {
                this.loadBackendWishlist();
                localStorage.removeItem(this.guestStorageKey);
              }
            }
          });
        } else {
          pendingCount--;
          if (pendingCount === 0) {
            this.wishlistSubject.next(wishlist);
            localStorage.removeItem(this.guestStorageKey);
          }
        }
      });
    });
  }

  private loadBackendWishlist() {
    this.http.get<ApiResponse<any>>(`${environment.apiUrl}/wishlist`).pipe(
      map((res) => this.mapBackendWishlist(res.data))
    ).subscribe((wishlist) => this.wishlistSubject.next(wishlist));
  }

  addItem(product: Product): void {
    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wishlist/items`, { productId: product.id }).pipe(
        map((res) => this.mapBackendWishlist(res.data))
      ).subscribe((wishlist) => this.wishlistSubject.next(wishlist));
    } else {
      const items = [...this.wishlistSubject.value.items];
      if (!items.find((item) => item.product.id === product.id)) {
        items.push({ product, addedAt: new Date().toISOString() });
        this.saveGuestWishlist(items);
      }
    }
  }

  removeItem(productId: string): void {
    if (this.authService.isLoggedIn()) {
      this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/wishlist/items/${productId}`).pipe(
        map((res) => this.mapBackendWishlist(res.data))
      ).subscribe((wishlist) => this.wishlistSubject.next(wishlist));
    } else {
      const items = this.wishlistSubject.value.items.filter((item) => item.product.id !== productId);
      this.saveGuestWishlist(items);
    }
  }

  moveToCart(product: Product): void {
    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wishlist/items/${product.id}/move-to-cart`, {}).pipe(
        map((res) => this.mapBackendWishlist(res.data))
      ).subscribe((wishlist) => {
        this.wishlistSubject.next(wishlist);
        this.cartService.loadCartFromBackend(); // refresh cart
      });
    } else {
      this.cartService.addItem(product, 1);
      this.removeItem(product.id);
    }
  }

  private mapBackendWishlist(backendWishlist: any): Wishlist {
    const items = (backendWishlist?.items || []).map((item: any) => {
      const productRaw = item.productId || {};
      const product: Product = {
        id: String(productRaw._id || productRaw.id || ''),
        title: productRaw.title || '',
        slug: productRaw.slug || '',
        description: productRaw.description || '',
        image: productRaw.image || '',
        brand: productRaw.brand || '',
        price: Number(productRaw.price || 0),
        salePrice: Number(productRaw.salePrice || 0),
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
        addedAt: item.addedAt || new Date().toISOString(),
      };
    });

    return { items };
  }
}
