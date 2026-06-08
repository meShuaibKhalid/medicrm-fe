import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonBadge } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonBadge],
  template: `
    <ion-tabs (ionTabsWillChange)="onTabChange($event)">
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="cart">
          <ion-icon name="bag-handle-outline"></ion-icon>
          <ion-label>Cart</ion-label>
          <ion-badge color="primary" *ngIf="cart$ | async as cart" style="position: absolute; top: 4px; right: calc(50% - 22px); font-size: 10px;">{{ cart.items.length }}</ion-badge>
        </ion-tab-button>
        <ion-tab-button tab="orders">
          <ion-icon name="receipt-outline"></ion-icon>
          <ion-label>Orders</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    @media (min-width: 992px) {
      ion-tab-bar {
        display: none;
      }
    }
  `],
})
export class TabsPage {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cart$ = this.cartService.cart$;

  onTabChange(event: any): void {
    if (event.tab === 'profile' && !this.authService.isLoggedIn()) {
      // Prevent Ionic from completing the tab switch
      event.preventDefault?.();
      // Navigate to login outside the tab context
      setTimeout(() => this.router.navigateByUrl('/login'), 0);
    }
  }
}