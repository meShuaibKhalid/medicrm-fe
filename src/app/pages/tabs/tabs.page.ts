import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonBadge } from '@ionic/angular/standalone';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonBadge],
  template: `
    <ion-router-outlet></ion-router-outlet>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="cart" href="/cart">
          <ion-icon name="bag-handle-outline"></ion-icon>
          <ion-label>Cart</ion-label>
          <ion-badge color="primary" *ngIf="cart$ | async as cart" style="position: absolute; top: 4px; right: calc(50% - 22px); font-size: 10px;">{{ cart.items.length }}</ion-badge>
        </ion-tab-button>
        <ion-tab-button tab="orders" href="/orders">
          <ion-icon name="receipt-outline"></ion-icon>
          <ion-label>Orders</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/profile">
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
  cart$ = this.cartService.cart$;
}
