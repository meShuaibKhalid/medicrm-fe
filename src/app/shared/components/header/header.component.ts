import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription, Observable, map } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AddressService } from '../../../core/services/address.service';
import { Brand, Category, Address, Product } from '../../../shared/models/app.models';
import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brand.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showHeader = true;
  private routerSub!: Subscription;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private addressService = inject(AddressService);
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  
  categories$ = this.categoryService.getCategoryTree();
  currentUser$ = this.authService.currentUser$;
  cart$ = this.cartService.cart$;
  wishlist$ = this.wishlistService.wishlist$;
  addresses$ = this.addressService.addresses$;
  searchTerm = '';
  searchOpen = false;
  isSearching = false;
  searchProducts: Product[] = [];
  searchBrands: Brand[] = [];
  defaultAddress$ = this.addressService.addresses$.pipe(
    map((addrs) => addrs.find((a) => a.isDefault) || addrs[0])
  );

  ngOnInit() {
    this.checkRoute(this.router.url);
    
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  private checkRoute(url: string) {
    // Hide header on admin routes and splash screen
    if (url.startsWith('/admin') || url.startsWith('/splash')) {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
  }

  checkSubmenuBounds(event: MouseEvent) {
    const item = event.currentTarget as HTMLElement;
    const dropdown = item.querySelector('.nested-dropdown') as HTMLElement | null;
    
    if (!dropdown) return;

    // Use a small timeout to allow the CSS hover (display: block) to apply
    setTimeout(() => {
      // Reset styles for fresh measurement
      dropdown.style.left = '100%';
      dropdown.style.right = 'auto';
      dropdown.style.top = '0';

      const rect = dropdown.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Adjust horizontally if it flows off the right edge
      if (rect.right > windowWidth) {
        dropdown.style.left = 'auto';
        dropdown.style.right = '100%';
      }

      // Adjust vertically if it flows off the bottom edge
      if (rect.bottom > windowHeight) {
        const overflow = rect.bottom - windowHeight + 20; // 20px padding
        // Ensure it doesn't go higher than the top of the screen
        const adjustedTop = Math.max(-overflow, -rect.top + 20);
        dropdown.style.top = `${adjustedTop}px`;
      }
    }, 10);
  }

  goToProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/profile');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  selectAddress(id: any): void {
    this.addressService.setDefaultAddress(id).subscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLocationClick(): void {
    if (!this.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    if (!value.trim()) {
      this.searchProducts = [];
      this.searchBrands = [];
      this.searchOpen = false;
      return;
    }

    this.searchOpen = true;
    this.isSearching = true;
    this.searchDebounceTimer = setTimeout(() => {
      this.loadSearchResults(value.trim());
    }, 250);
  }

  closeSearch(): void {
    this.searchOpen = false;
  }

  goToProduct(product: Product): void {
    this.searchOpen = false;
    this.searchTerm = '';
    this.router.navigate(['/products', product.slug]);
  }

  goToBrand(brand: Brand): void {
    this.searchOpen = false;
    this.searchTerm = '';
    this.router.navigate(['/brands', brand.slug]);
  }

  private loadSearchResults(term: string): void {
    this.productService.searchProducts({ search: term, limit: 6, sort: 'latest' }).subscribe({
      next: (products) => {
        this.searchProducts = products.slice(0, 6);
        this.brandService.getBrands().subscribe({
          next: (brands) => {
            this.searchBrands = brands.filter((brand) =>
              brand.name.toLowerCase().includes(term.toLowerCase()),
            ).slice(0, 6);
            this.isSearching = false;
            this.searchOpen = true;
          },
          error: () => {
            this.searchBrands = [];
            this.isSearching = false;
          },
        });
      },
      error: () => {
        this.searchProducts = [];
        this.brandService.getBrands().subscribe({
          next: (brands) => {
            this.searchBrands = brands.filter((brand) =>
              brand.name.toLowerCase().includes(term.toLowerCase()),
            ).slice(0, 6);
            this.isSearching = false;
            this.searchOpen = true;
          },
          error: () => {
            this.searchBrands = [];
            this.isSearching = false;
          },
        });
      },
    });
  }
}
