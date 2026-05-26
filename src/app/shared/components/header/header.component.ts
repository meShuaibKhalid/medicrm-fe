import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription, Observable, map } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AddressService } from '../../../core/services/address.service';
import { Category, Address } from '../../../shared/models/app.models';

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
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private addressService = inject(AddressService);
  
  categories$ = this.categoryService.getCategoryTree();
  currentUser$ = this.authService.currentUser$;
  cart$ = this.cartService.cart$;
  wishlist$ = this.wishlistService.wishlist$;
  addresses$ = this.addressService.addresses$;
  defaultAddress$ = this.addressService.addresses$.pipe(
    map((addrs) => addrs.find((a) => a.isDefault) || addrs[0])
  );

  constructor(private router: Router) {}

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
}
